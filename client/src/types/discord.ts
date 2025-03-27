export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  created_at?: string;
  account_age?: string;
}

export interface DiscordApiResponse {
  user: DiscordUser;
  created_at: string;
  account_age: string;
}

export interface DiscordApiError {
  message: string;
  code?: number;
}
