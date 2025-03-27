import { users, type User, type InsertUser } from "@shared/schema";

// Interface with CRUD methods needed for the application
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(user: User): Promise<User>;
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
      tokenExpires: insertUser.tokenExpires || null
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
}

export const storage = new MemStorage();
