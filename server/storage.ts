import { users, type User, type InsertUser } from "@shared/schema";

// Interface with CRUD methods needed for the application
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(user: User): Promise<User>;
  addToHistory(userId: number, type: 'lookup' | 'roulette' | 'friend', discordId: string): Promise<User>;
  getHistory(userId: number, type: 'lookup' | 'roulette' | 'friend'): Promise<string[]>;
  updateBalance(userId: number, amount: number): Promise<User>;
  addDailyBalance(userId: number): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordId === discordId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const createdAt = new Date();
    
    // Set admin status based on the admin discord ID when available
    const isAdmin = insertUser.discordId === "1221785564450394186";
    
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      avatar: insertUser.avatar || null,
      accessToken: insertUser.accessToken || null,
      refreshToken: insertUser.refreshToken || null,
      tokenExpires: insertUser.tokenExpires || null,
      lookupHistory: [],
      rouletteHistory: [],
      friendHistory: [],
      balance: 0,
      lastBalanceUpdate: null,
      isAdmin
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(updatedUser: User): Promise<User> {
    if (!this.users.has(updatedUser.id)) {
      throw new Error(`User with ID ${updatedUser.id} not found`);
    }
    
    this.users.set(updatedUser.id, updatedUser);
    return updatedUser;
  }
  
  async addToHistory(userId: number, type: 'lookup' | 'roulette' | 'friend', discordId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Initialize history arrays if they don't exist
    if (!user.lookupHistory) user.lookupHistory = [];
    if (!user.rouletteHistory) user.rouletteHistory = [];
    if (!user.friendHistory) user.friendHistory = [];
    
    // Add to the appropriate history
    if (type === 'lookup') {
      user.lookupHistory.unshift(discordId);
    } else if (type === 'roulette') {
      user.rouletteHistory.unshift(discordId);
    } else if (type === 'friend') {
      user.friendHistory.unshift(discordId);
    }
    
    // Update the user
    return this.updateUser(user);
  }
  
  async getHistory(userId: number, type: 'lookup' | 'roulette' | 'friend'): Promise<string[]> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Return the appropriate history
    if (type === 'lookup') {
      return user.lookupHistory || [];
    } else if (type === 'roulette') {
      return user.rouletteHistory || [];
    } else if (type === 'friend') {
      return user.friendHistory || [];
    }
    
    return [];
  }
  
  async updateBalance(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Initialize balance if it doesn't exist
    if (user.balance === undefined) {
      user.balance = 0;
    }
    
    // Update the balance
    user.balance += amount;
    
    // Ensure balance isn't negative
    if (user.balance < 0) {
      user.balance = 0;
    }
    
    return this.updateUser(user);
  }
  
  async addDailyBalance(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Initialize balance and lastBalanceUpdate if they don't exist
    if (user.balance === undefined) {
      user.balance = 0;
    }
    
    const now = new Date();
    
    // Check if it's a new day since the last update
    let shouldAddBalance = false;
    
    if (!user.lastBalanceUpdate) {
      // First time adding balance
      shouldAddBalance = true;
    } else {
      const lastUpdate = new Date(user.lastBalanceUpdate);
      
      // Check if it's a different calendar day
      if (
        now.getFullYear() !== lastUpdate.getFullYear() ||
        now.getMonth() !== lastUpdate.getMonth() ||
        now.getDate() !== lastUpdate.getDate()
      ) {
        shouldAddBalance = true;
      }
    }
    
    if (shouldAddBalance) {
      // Add daily balance (maximum 20)
      user.balance = Math.min((user.balance || 0) + 10, 20);
      user.lastBalanceUpdate = now;
    }
    
    return this.updateUser(user);
  }
}

export const storage = new MemStorage();
