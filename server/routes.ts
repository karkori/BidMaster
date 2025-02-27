import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
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

  app.get("/api/auctions", async (_req, res) => {
    const auctions = await storage.getActiveAuctions();
    res.json(auctions);
  });

  app.post("/api/auctions", requireAuth, async (req, res) => {
    const result = insertAuctionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid auction data" });
    }

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

    res.status(201).json(auction);
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

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    ws.on("message", async (data) => {
      try {
        const bid = JSON.parse(data.toString());
        const result = insertBidSchema.safeParse(bid);

        if (!result.success) {
          ws.send(JSON.stringify({ error: "Invalid bid data" }));
          return;
        }

        const auction = await storage.getAuction(bid.auctionId);
        if (!auction || !auction.isActive || auction.endTime < new Date()) {
          ws.send(JSON.stringify({ error: "Auction is not active" }));
          return;
        }

        if (bid.amount <= auction.currentPrice) {
          ws.send(JSON.stringify({ error: "Bid must be higher than current price" }));
          return;
        }

        await storage.updateAuctionPrice(bid.auctionId, bid.amount);
        const newBid = await storage.createBid({
          ...bid,
          bidderId: (ws as any).user?.id || 0,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "bid", data: newBid }));
          }
        });
      } catch (error) {
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
  });

  return httpServer;
}