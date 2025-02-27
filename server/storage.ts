import type { InsertUser, User, Auction, Bid } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createAuction(auction: Omit<Auction, "id">): Promise<Auction>;
  getAuction(id: number): Promise<Auction | undefined>;
  getActiveAuctions(): Promise<Auction[]>;
  updateAuctionPrice(id: number, price: number): Promise<void>;
  
  createBid(bid: Omit<Bid, "id" | "createdAt">): Promise<Bid>;
  getAuctionBids(auctionId: number): Promise<Bid[]>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private auctions: Map<number, Auction>;
  private bids: Map<number, Bid>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.auctions = new Map();
    this.bids = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAuction(auction: Omit<Auction, "id">): Promise<Auction> {
    const id = this.currentId++;
    const newAuction: Auction = { ...auction, id };
    this.auctions.set(id, newAuction);
    return newAuction;
  }

  async getAuction(id: number): Promise<Auction | undefined> {
    return this.auctions.get(id);
  }

  async getActiveAuctions(): Promise<Auction[]> {
    return Array.from(this.auctions.values()).filter(
      (auction) => auction.isActive && auction.endTime > new Date(),
    );
  }

  async updateAuctionPrice(id: number, price: number): Promise<void> {
    const auction = await this.getAuction(id);
    if (!auction) throw new Error("Auction not found");
    this.auctions.set(id, { ...auction, currentPrice: price });
  }

  async createBid(bid: Omit<Bid, "id" | "createdAt">): Promise<Bid> {
    const id = this.currentId++;
    const newBid: Bid = { ...bid, id, createdAt: new Date() };
    this.bids.set(id, newBid);
    return newBid;
  }

  async getAuctionBids(auctionId: number): Promise<Bid[]> {
    return Array.from(this.bids.values())
      .filter((bid) => bid.auctionId === auctionId)
      .sort((a, b) => b.amount - a.amount);
  }
}

export const storage = new MemStorage();
