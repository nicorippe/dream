import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { fetchDiscordUser, calculateAccountCreationDetails } from "./discord";

export async function registerRoutes(app: Express): Promise<Server> {
  // Discord user lookup route
  app.get("/api/discord/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the ID format (snowflake format: 17-19 digits)
      if (!id.match(/^\d{17,19}$/)) {
        return res.status(400).json({ 
          message: "Invalid Discord ID format. IDs are 17-19 digits in length." 
        });
      }
      
      // Fetch user from Discord API
      const user = await fetchDiscordUser(id);
      
      if (!user) {
        return res.status(404).json({ 
          message: "User not found. Please check the ID and try again." 
        });
      }
      
      // Calculate account creation date
      const { formattedDate, accountAge } = calculateAccountCreationDetails(id);
      
      // Return user data with creation details
      res.json({
        user,
        created_at: formattedDate,
        account_age: accountAge
      });
      
    } catch (error: any) {
      console.error("Discord API error:", error);
      
      // Handle Discord API errors
      if (error.status === 404) {
        return res.status(404).json({ 
          message: "User not found. Please check the ID and try again." 
        });
      }
      
      res.status(error.status || 500).json({ 
        message: error.message || "An error occurred while retrieving Discord user data." 
      });
    }
  });

  // Discord roulette route - Get random Discord user from roulette.txt
  app.get("/api/discord/roulette", async (req, res) => {
    try {
      // Read the roulette.txt file with Discord IDs
      const roulettePath = path.join(process.cwd(), "roulette.txt");
      const fileContent = fs.readFileSync(roulettePath, "utf-8");
      
      // Split by lines and filter empty lines
      const discordIds = fileContent.split("\n").filter(id => id.trim().length > 0);
      
      if (discordIds.length === 0) {
        return res.status(404).json({ 
          message: "No Discord IDs available in the roulette." 
        });
      }
      
      // Get a random ID from the list
      const randomIndex = Math.floor(Math.random() * discordIds.length);
      const randomId = discordIds[randomIndex].trim();
      
      // Fetch user from Discord API
      const user = await fetchDiscordUser(randomId);
      
      if (!user) {
        return res.status(404).json({ 
          message: "Selected user not found. Please try again." 
        });
      }
      
      // Calculate account creation date
      const { formattedDate, accountAge } = calculateAccountCreationDetails(randomId);
      
      // Return user data with creation details
      res.json({
        user,
        created_at: formattedDate,
        account_age: accountAge
      });
      
    } catch (error: any) {
      console.error("Discord Roulette error:", error);
      
      res.status(error.status || 500).json({ 
        message: error.message || "An error occurred while retrieving random Discord user." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
