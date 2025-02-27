import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAuctionSchema, insertBidSchema } from "@shared/schema";

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // SSE endpoint for real-time updates
  app.get("/api/auctions/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial auctions data
    storage.getActiveAuctions().then((auctions) => {
      send({ type: "initial", data: auctions });
    });

    // Store the client's send function
    const clients = app.locals.sseClients || new Set();
    clients.add(send);
    app.locals.sseClients = clients;

    // Remove client on connection close
    req.on("close", () => {
      clients.delete(send);
    });
  });

  // REST endpoints
  app.get("/api/auctions", async (_req, res) => {
    const auctions = await storage.getActiveAuctions();
    res.json(auctions);
  });

  app.post("/api/auctions", requireAuth, async (req, res) => {
    console.log("Creating auction:", req.body);
    console.log("User:", req.user);

    const result = insertAuctionSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Invalid auction data:", result.error);
      return res.status(400).json({ message: "Invalid auction data", errors: result.error.errors });
    }

    try {
      const { duration, ...data } = result.data;
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + duration);

      const auction = await storage.createAuction({
        ...data,
        sellerId: req.user!.id,
        currentPrice: data.startingPrice,
        endTime,
        isActive: true,
      });

      // Notify SSE clients about new auction
      const clients = app.locals.sseClients as Set<Function>;
      clients?.forEach(send => {
        send({ type: "new_auction", data: auction });
      });

      console.log("Auction created successfully:", auction);
      res.status(201).json(auction);
    } catch (error) {
      console.error("Error creating auction:", error);
      res.status(500).json({ message: "Error creating auction" });
    }
  });

  app.post("/api/auctions/:id/bid", requireAuth, async (req, res) => {
    console.log("New bid:", req.body);
    console.log("User:", req.user);

    const result = insertBidSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Invalid bid data:", result.error);
      return res.status(400).json({ message: "Invalid bid data", errors: result.error.errors });
    }

    try {
      const auctionId = Number(req.params.id);
      const auction = await storage.getAuction(auctionId);

      if (!auction || !auction.isActive || auction.endTime < new Date()) {
        return res.status(400).json({ message: "Auction is not active" });
      }

      if (req.body.amount <= auction.currentPrice) {
        return res.status(400).json({ message: "Bid must be higher than current price" });
      }

      await storage.updateAuctionPrice(auctionId, req.body.amount);
      const bid = await storage.createBid({
        ...req.body,
        auctionId,
        bidderId: req.user!.id,
      });

      // Notify SSE clients about new bid
      const clients = app.locals.sseClients as Set<Function>;
      clients?.forEach(send => {
        send({ type: "new_bid", data: { bid, auctionId, currentPrice: req.body.amount } });
      });

      console.log("Bid created successfully:", bid);
      res.status(201).json(bid);
    } catch (error) {
      console.error("Error creating bid:", error);
      res.status(500).json({ message: "Error creating bid" });
    }
  });

  app.get("/api/auctions/:id", async (req, res) => {
    const auction = await storage.getAuction(Number(req.params.id));
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    res.json(auction);
  });

  app.get("/api/auctions/:id/bids", async (req, res) => {
    const bids = await storage.getAuctionBids(Number(req.params.id));
    res.json(bids);
  });

  const httpServer = createServer(app);
  return httpServer;
}