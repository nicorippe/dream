import { useQuery } from "@tanstack/react-query";

// Type definitions for auth responses
export type User = {
  id: number;
  discordId?: string;
  username: string;
  avatar: string | null;
  lookupHistory?: string[];
  rouletteHistory?: string[];
  friendHistory?: string[];
  balance?: number;
  lastBalanceUpdate?: string | null;
  isAdmin?: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
};

export type AuthResponse = {
  isLoggedIn: boolean;
  user?: User;
};

/**
 * Custom hook for accessing authentication state
 */
export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) {
        throw new Error("Failed to fetch auth session");
      }
      return res.json();
    },
  });

  return {
    isLoggedIn: data?.isLoggedIn || false,
    user: data?.user || null,
    isLoading,
    error,
    refetch
  };
}