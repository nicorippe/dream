import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

// Users table for Discord authenticated users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpires: timestamp("token_expires"),
  createdAt: timestamp("created_at").defaultNow(),
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
  }).optional(),
  isLoggedIn: z.boolean().default(false),
});

// Custom type for User with appropriate nullability
export type User = {
  id: number;
  discordId: string;
  username: string;
  avatar: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpires: Date | null;
  createdAt: Date | null;
};

// Custom InsertUser type
export type InsertUser = {
  discordId: string;
  username: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpires?: Date;
};

export type DiscordUser = z.infer<typeof discordUserSchema>;
export type Session = z.infer<typeof sessionSchema>;
