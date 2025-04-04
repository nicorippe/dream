import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

// Users table for Discord authenticated users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").unique(),
  username: text("username").notNull().unique(),
  password: text("password"), // For local authentication
  avatar: text("avatar"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpires: timestamp("token_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  // Add history fields
  lookupHistory: text("lookup_history").array(),
  rouletteHistory: text("roulette_history").array(),
  friendHistory: text("friend_history").array(),
  // Add balance and admin fields
  balance: text("balance").default("0"),
  lastBalanceUpdate: timestamp("last_balance_update"),
  isAdmin: text("is_admin").default("false"),
});

// Discord user schema for API responses
export const discordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string(),
  avatar: z.string().nullable(),
  bot: z.boolean().optional(),
  system: z.boolean().optional(),
  banner: z.string().nullable().optional(),
  accent_color: z.number().nullable().optional(),
  created_at: z.string().optional(),
  account_age: z.string().optional(),
});

// Session schema for auth
export const sessionSchema = z.object({
  user: z.object({
    id: z.number(),
    discordId: z.string(),
    username: z.string(),
    avatar: z.string().nullable(),
    lookupHistory: z.array(z.string()).optional(),
    rouletteHistory: z.array(z.string()).optional(),
    friendHistory: z.array(z.string()).optional(),
    balance: z.number().optional(),
    lastBalanceUpdate: z.date().nullable().optional(),
    isAdmin: z.boolean().optional(),
  }).optional(),
  isLoggedIn: z.boolean().default(false),
});

// Custom type for User with appropriate nullability
export type User = {
  id: number;
  discordId?: string;
  username: string;
  password?: string;
  avatar: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpires: Date | null;
  createdAt: Date | null;
  lookupHistory?: string[];
  rouletteHistory?: string[];
  friendHistory?: string[];
  balance?: number;
  lastBalanceUpdate?: Date | null;
  isAdmin?: boolean;
};

// Custom InsertUser type
export type InsertUser = {
  discordId?: string;
  username: string;
  password?: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpires?: Date;
};

export type DiscordUser = z.infer<typeof discordUserSchema>;
export type Session = z.infer<typeof sessionSchema>;
