import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";

export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<Session>({
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
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 3, // Retry 3 times if the request fails
  });

  return {
    isLoading,
    error,
    isLoggedIn: data?.isLoggedIn || false,
    user: data?.user,
    refetch,
  };
}