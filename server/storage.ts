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
      friendHistory: []
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
}

export const storage = new MemStorage();
