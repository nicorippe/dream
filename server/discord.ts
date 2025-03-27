import { discordUserSchema, type DiscordUser } from "@shared/schema";
import { getTimestampFromSnowflake, formatDate, calculateAccountAge } from "../client/src/lib/utils";

/**
 * Fetches a Discord user by their ID using Discord's API
 */
export async function fetchDiscordUser(id: string): Promise<DiscordUser | null> {
  try {
    const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.message || `Discord API error: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    const userData = await response.json();
    // Validate the response data using Zod schema
    return discordUserSchema.parse(userData);
  } catch (error) {
    console.error("Error fetching Discord user:", error);
    throw error;
  }
}

/**
 * Calculates account creation date and age from a Discord ID (snowflake)
 */
export function calculateAccountCreationDetails(id: string): { 
  timestamp: number;
  formattedDate: string;
  accountAge: string;
} {
  // Extract the timestamp from the snowflake
  const timestamp = getTimestampFromSnowflake(id);
  const creationDate = new Date(timestamp);
  
  return {
    timestamp,
    formattedDate: formatDate(creationDate),
    accountAge: calculateAccountAge(timestamp)
  };
}
