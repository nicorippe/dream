import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";

export function useAuth() {
  const { data, isLoading, error } = useQuery<Session>({
    queryKey: ['/api/auth/session'],
    queryFn: async () => {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch authentication status');
      }
      
      return await response.json();
    },
  });

  return {
    isLoading,
    error,
    isLoggedIn: data?.isLoggedIn || false,
    user: data?.user,
  };
}