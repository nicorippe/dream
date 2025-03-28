import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Coins, Clock, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserBalance() {
  const { user } = useAuth();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/user/balance"],
    queryFn: async () => {
      const res = await fetch("/api/user/balance");
      if (!res.ok) {
        throw new Error("Failed to fetch balance");
      }
      return res.json();
    },
    enabled: !!user, // Only run the query if the user is logged in
  });
  
  // Format last update date
  const formatLastUpdate = (date: string | null) => {
    if (!date) return "Never";
    
    const lastUpdate = new Date(date);
    return lastUpdate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="mr-2 h-5 w-5 text-primary" />
            Your Balance
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Earn 10 coins daily (max 20)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-3xl font-bold">
            {isLoading ? "Loading..." : `${data?.balance || 0} coins`}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            Last updated: {isLoading ? "..." : formatLastUpdate(data?.lastBalanceUpdate)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}