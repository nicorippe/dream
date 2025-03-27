import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import { storage } from "./storage";
import type { Express, Request } from "express";
import type { User } from "@shared/schema";
import MemoryStore from "memorystore";

// Define what Discord scopes we need
const DISCORD_SCOPES = ["identify"];

// Initialize Passport with Discord strategy
export function setupAuth(app: Express) {
  // Create memory store for sessions
  const MemoryStoreSession = MemoryStore(session);
  
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "nashihub-secret",
      resave: true,
      saveUninitialized: true,
      cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: false, // Set to false to work on Replit's environment
        httpOnly: true,
        sameSite: 'lax'
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure Passport serialization/deserialization
  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user with ID:", id);
      const user = await storage.getUser(id);
      console.log("Deserialized user:", user);
      done(null, user);
    } catch (err) {
      console.error("Error deserializing user:", err);
      done(err, null);
    }
  });
  
  // Configure Discord strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID || "",
        clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
        callbackURL: "https://" + process.env.REPL_SLUG + "." + process.env.REPL_OWNER + ".replit.dev/api/auth/discord/callback",
        scope: DISCORD_SCOPES
      },
      async (accessToken, refreshToken, profile: any, done) => {
        try {
          // Look for existing user
          let user = await storage.getUserByDiscordId(profile.id);
          
          // Calculate when the token will expire (default 1 week)
          const tokenExpires = new Date();
          tokenExpires.setSeconds(tokenExpires.getSeconds() + 604800);
          
          if (user) {
            // Update existing user with new tokens
            user = await storage.updateUser({
              ...user,
              username: profile.username,
              avatar: profile.avatar || null,
              accessToken,
              refreshToken,
              tokenExpires
            });
          } else {
            // Create new user
            user = await storage.createUser({
              discordId: profile.id,
              username: profile.username,
              avatar: profile.avatar || null,
              accessToken,
              refreshToken,
              tokenExpires
            });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
  
  // Authentication routes
  setupAuthRoutes(app);
}

// Setup authentication routes
function setupAuthRoutes(app: Express) {
  // Login route
  app.get("/api/auth/discord", passport.authenticate("discord"));
  
  // Callback route after Discord authentication
  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/?auth=failed"
    }),
    (req, res) => {
      // Log authentication state
      console.log("Authentication successful, isAuthenticated:", req.isAuthenticated());
      console.log("User:", req.user);
      
      // Successful authentication, redirect to dashboard after a short delay
      // to make sure the session is properly saved
      setTimeout(() => {
        res.redirect("/dashboard");
      }, 500);
    }
  );
  
  // Logout route
  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
  
  // Get session info
  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as User;
      res.json({
        isLoggedIn: true,
        user: {
          id: user.id,
          discordId: user.discordId,
          username: user.username,
          avatar: user.avatar
        }
      });
    } else {
      res.json({
        isLoggedIn: false
      });
    }
  });
}

// Middleware for protecting routes
export function requireAuth(req: Request, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Authentication required" });
}