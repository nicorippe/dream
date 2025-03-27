import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { DiscordApiResponse } from "@/types/discord";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCard from "./UserCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function EgirlRoulette() {
  const [isRolling, setIsRolling] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/discord/roulette'],
    enabled: false,
    queryFn: async () => {
      setIsRolling(true);
      try {
        const response = await fetch('/api/discord/roulette', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch random Discord user');
        }
        
        return await response.json() as DiscordApiResponse;
      } finally {
        setIsRolling(false);
      }
    }
  });

  const handleRoll = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gradient">Egirl Roulette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground mb-4">
          Clicca il pulsante per trovare un profilo Discord casuale dalla nostra collezione.
        </div>
        <Button 
          onClick={handleRoll} 
          disabled={isRolling}
          className="w-full btn-gradient"
        >
          {isRolling ? "Rolliamo..." : "Rolla"}
        </Button>
        
        {isLoading && (
          <div className="mt-4">
            <Skeleton className="w-full h-64" />
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500">
            Si è verificato un errore. Riprova più tardi.
          </div>
        )}

        {data && !isLoading && (
          <div className="mt-4">
            <UserCard 
              user={data.user} 
              createdAt={data.created_at} 
              accountAge={data.account_age} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}