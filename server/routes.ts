import type { Express } from "express";
import { createServer, type Server } from "http";
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

  const httpServer = createServer(app);
  return httpServer;
}
