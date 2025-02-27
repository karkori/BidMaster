import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  startingPrice: integer("starting_price").notNull(),
  currentPrice: integer("current_price").notNull(),
  endTime: timestamp("end_time").notNull(),
  sellerId: integer("seller_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  auctionId: integer("auction_id").notNull(),
  bidderId: integer("bidder_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAuctionSchema = createInsertSchema(auctions)
  .pick({
    title: true,
    description: true,
    imageUrl: true,
    startingPrice: true,
    endTime: true,
  })
  .extend({
    duration: z.number().min(1).max(7),
  });

export const insertBidSchema = createInsertSchema(bids).pick({
  amount: true,
  auctionId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Auction = typeof auctions.$inferSelect;
export type Bid = typeof bids.$inferSelect;
