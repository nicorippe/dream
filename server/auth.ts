import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import { storage } from "./storage";
import type { Express, Request } from "express";
import type { User } from "@shared/schema";
import MemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Define what Discord scopes we need
const DISCORD_SCOPES = ["identify"];
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

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

  // Configure Local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password || ''))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Configure Discord strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID || "",
        clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
        callbackURL: "https://nashi-hub.atzenineve.replit.app/api/auth/discord/callback",
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
  // Local authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ isLoggedIn: false });
    }
    
    const user = req.user as User;
    
    // Update daily balance when checking the session
    if (user) {
      storage.addDailyBalance(user.id).catch(err => {
        console.error("Error updating daily balance:", err);
      });
    }
    
    res.json({ isLoggedIn: true, user });
  });
  
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user as User;
    
    // Update daily balance when checking the session
    if (user) {
      storage.addDailyBalance(user.id).catch(err => {
        console.error("Error updating daily balance:", err);
      });
    }
    
    res.json(user);
  });

  // Discord OAuth routes
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
}

// Middleware for protecting routes
export function requireAuth(req: Request, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ message: "Authentication required" });
}