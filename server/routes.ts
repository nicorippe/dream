import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { fetchDiscordUser, calculateAccountCreationDetails } from "./discord";
import { User } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
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
      
      // Skip deleted users
      if (user.username.toLowerCase().includes("deleted_user")) {
        return res.status(404).json({
          message: "This user is no longer on Discord."
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
      // Get filter parameters
      const { year, nitro } = req.query;
      
      // Read the roulette.txt file with Discord IDs
      const roulettePath = path.join(process.cwd(), "roulette.txt");
      const fileContent = fs.readFileSync(roulettePath, "utf-8");
      
      // Split by lines and filter empty lines and deleted users
      const discordIds = fileContent.split("\n").filter(id => {
        const trimmed = id.trim();
        return trimmed.length > 0 && !trimmed.includes("deleted_user");
      });
      
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
      
      // Apply year filtering if specified
      if (year && typeof year === 'string') {
        const targetYear = parseInt(year);
        if (!isNaN(targetYear)) {
          // Need to process IDs one by one until we find matches
          let yearFilteredIds: string[] = [];
          
          // Try filtering some IDs by year (limit to avoid too many API calls)
          const maxChecks = Math.min(filteredIds.length, 20);
          const idsToCheck = [...filteredIds].sort(() => 0.5 - Math.random()).slice(0, maxChecks);
          
          for (const id of idsToCheck) {
            const { formattedDate } = calculateAccountCreationDetails(id.trim());
            const creationYear = new Date(formattedDate).getFullYear();
            
            if (creationYear === targetYear) {
              yearFilteredIds.push(id);
            }
          }
          
          if (yearFilteredIds.length > 0) {
            filteredIds = yearFilteredIds;
          } else {
            return res.status(404).json({
              message: `No users found from the year ${targetYear}. Try a different year.`
            });
          }
        }
      }
      
      // Get a random ID from the filtered list
      const randomIndex = Math.floor(Math.random() * filteredIds.length);
      const randomId = filteredIds[randomIndex].trim();
      
      // Fetch user from Discord API
      const user = await fetchDiscordUser(randomId);
      
      if (!user) {
        return res.status(404).json({ 
          message: "Selected user not found. Please try again." 
        });
      }
      
      // Skip deleted users
      if (user.username.toLowerCase().includes("deleted_user")) {
        return res.status(404).json({
          message: "Selected user is no longer on Discord. Please try again."
        });
      }
      
      // Check for Nitro filter
      if (nitro === 'true' && !user.banner) {
        // Try to find a Nitro user with banner (limited attempts)
        const maxAttempts = 5;
        let foundNitroUser = false;
        
        for (let i = 0; i < maxAttempts && !foundNitroUser; i++) {
          // Get another random ID
          const newIndex = Math.floor(Math.random() * filteredIds.length);
          if (newIndex !== randomIndex) { // Avoid checking the same ID
            const newId = filteredIds[newIndex].trim();
            const nitroUser = await fetchDiscordUser(newId);
            
            if (nitroUser && nitroUser.banner) {
              // Found a Nitro user with banner
              const { formattedDate, accountAge } = calculateAccountCreationDetails(newId);
              
              // Add to user's history if authenticated
              if (req.isAuthenticated()) {
                const authUser = req.user as User;
                await storage.addToHistory(authUser.id, 'roulette', newId);
              }
              
              return res.json({
                user: nitroUser,
                created_at: formattedDate,
                account_age: accountAge
              });
            }
          }
        }
        
        // Couldn't find a Nitro user in the allowed attempts
        if (!foundNitroUser) {
          return res.status(404).json({
            message: "Couldn't find a Nitro user with a banner. Try again or disable the Nitro filter."
          });
        }
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
      
      // Skip deleted users
      if (user.username.toLowerCase().includes("deleted_user")) {
        return res.status(404).json({
          message: "This user is no longer on Discord."
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
  
  // User balance routes
  app.get("/api/user/balance", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const authUser = req.user as User;
      
      // Update daily balance
      const user = await storage.addDailyBalance(authUser.id);
      
      res.json({ 
        balance: user.balance || 0,
        lastBalanceUpdate: user.lastBalanceUpdate 
      });
    } catch (error: any) {
      console.error("Balance error:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });
  
  // Use balance route
  app.post("/api/user/balance/use", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const authUser = req.user as User;
      const { amount } = req.body;
      
      if (typeof amount !== 'number') {
        return res.status(400).json({ message: "Amount must be a number" });
      }
      
      // Check if user has enough balance
      if ((authUser.balance || 0) + amount < 0) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update balance
      const user = await storage.updateBalance(authUser.id, amount);
      
      res.json({ 
        balance: user.balance || 0,
        lastBalanceUpdate: user.lastBalanceUpdate 
      });
    } catch (error: any) {
      console.error("Balance use error:", error);
      res.status(500).json({ message: "Failed to use balance" });
    }
  });
  
  // Admin routes
  app.post("/api/admin/update-balance", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const authUser = req.user as User;
      if (!authUser.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { targetDiscordId, amount } = req.body;
      
      if (!targetDiscordId || typeof amount !== 'number') {
        return res.status(400).json({ message: "Target Discord ID and amount are required" });
      }
      
      // Find the target user
      const targetUser = await storage.getUserByDiscordId(targetDiscordId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }
      
      // Update the balance
      const updatedUser = await storage.updateBalance(targetUser.id, amount);
      
      res.json({ 
        success: true,
        user: {
          discordId: updatedUser.discordId,
          username: updatedUser.username,
          balance: updatedUser.balance
        }
      });
    } catch (error: any) {
      console.error("Admin error:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
