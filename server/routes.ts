import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { fetchDiscordUser, calculateAccountCreationDetails } from "./discord";
import { User } from "@shared/schema";

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
      
      // Add to user's history if authenticated
      if (req.isAuthenticated()) {
        const authUser = req.user as User;
        await storage.addToHistory(authUser.id, 'lookup', id);
      }
      
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
      
      // If user is authenticated, filter out already seen discord IDs
      let filteredIds = discordIds;
      if (req.isAuthenticated()) {
        const authUser = req.user as User;
        const history = await storage.getHistory(authUser.id, 'roulette');
        filteredIds = discordIds.filter(id => !history.includes(id.trim()));
        
        // If all IDs have been seen, use the full list
        if (filteredIds.length === 0) {
          filteredIds = discordIds;
        }
      }
      
      // Get a random ID from the list
      const randomIndex = Math.floor(Math.random() * filteredIds.length);
      const randomId = filteredIds[randomIndex].trim();
      
      // Fetch user from Discord API
      const user = await fetchDiscordUser(randomId);
      
      if (!user) {
        return res.status(404).json({ 
          message: "Selected user not found. Please try again." 
        });
      }
      
      // Add to user's history if authenticated
      if (req.isAuthenticated()) {
        const authUser = req.user as User;
        await storage.addToHistory(authUser.id, 'roulette', randomId);
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

  // Friend finder route - Find Discord users from friends.txt by name
  app.get("/api/discord/friends/search", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ 
          message: "Search query is required" 
        });
      }
      
      // Read the friends.txt file with Discord usernames and IDs
      const friendsPath = path.join(process.cwd(), "friends.txt");
      const fileContent = fs.readFileSync(friendsPath, "utf-8");
      
      // Split by lines and filter empty lines
      const lines = fileContent.split("\n").filter(line => line.trim().length > 0);
      
      if (lines.length === 0) {
        return res.status(404).json({ 
          message: "No friends available in the database." 
        });
      }
      
      // Search for friends that contain the query in their username
      const searchResults = lines
        .filter(line => {
          const [username] = line.split(";");
          return username.toLowerCase().includes(query.toLowerCase());
        })
        .map(line => {
          const [username, discordId] = line.split(";");
          return { username, discordId: discordId.trim() };
        });
      
      if (searchResults.length === 0) {
        return res.status(404).json({ 
          message: "No friends found with that name." 
        });
      }
      
      // Return the search results
      res.json({
        results: searchResults,
        total: searchResults.length
      });
      
    } catch (error: any) {
      console.error("Friend finder error:", error);
      
      res.status(error.status || 500).json({ 
        message: error.message || "An error occurred while searching for friends." 
      });
    }
  });
  
  // Friend details route - Get details for a specific friend by ID
  app.get("/api/discord/friends/:id", async (req, res) => {
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
          message: "Friend not found. Please check the ID and try again." 
        });
      }
      
      // Add to user's history if authenticated
      if (req.isAuthenticated()) {
        const authUser = req.user as User;
        await storage.addToHistory(authUser.id, 'friend', id);
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
      console.error("Friend details error:", error);
      
      res.status(error.status || 500).json({ 
        message: error.message || "An error occurred while retrieving friend details." 
      });
    }
  });
  
  // History routes
  app.get("/api/user/history/:type", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { type } = req.params;
      if (!['lookup', 'roulette', 'friend'].includes(type)) {
        return res.status(400).json({ message: "Invalid history type" });
      }
      
      const authUser = req.user as User;
      const history = await storage.getHistory(authUser.id, type as 'lookup' | 'roulette' | 'friend');
      
      res.json({ history });
    } catch (error: any) {
      console.error("History error:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
