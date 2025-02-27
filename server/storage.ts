import type { InsertUser, User, Auction, Bid } from "@shared/schema";
import { users, auctions, bids } from "@shared/schema";
import { db } from "./db";
import { eq, and, lt, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createAuction(auction: Omit<Auction, "id">): Promise<Auction> {
    const [newAuction] = await db.insert(auctions).values(auction).returning();
    return newAuction;
  }

  async getAuction(id: number): Promise<Auction | undefined> {
    const [auction] = await db.select().from(auctions).where(eq(auctions.id, id));
    return auction;
  }

  async getActiveAuctions(): Promise<Auction[]> {
    return db
      .select()
      .from(auctions)
      .where(
        and(
          eq(auctions.isActive, true),
          lt(auctions.endTime, new Date())
        )
      );
  }

  async updateAuctionPrice(id: number, price: number): Promise<void> {
    await db
      .update(auctions)
      .set({ currentPrice: price })
      .where(eq(auctions.id, id));
  }

  async createBid(bid: Omit<Bid, "id" | "createdAt">): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }

  async getAuctionBids(auctionId: number): Promise<Bid[]> {
    return db
      .select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId))
      .orderBy(desc(bids.amount));
  }
}

export const storage = new DatabaseStorage();