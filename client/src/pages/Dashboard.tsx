import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import DiscordUserLookup from "@/components/DiscordUserLookup";
import EgirlRoulette from "@/components/EgirlRoulette";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("roulette");
  const { isLoggedIn, isLoading, user } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setLocation("/?auth=required");
    }
  }, [isLoading, isLoggedIn, setLocation]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-10">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-10 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </main>
      </div>
    );
  }
  
  // If not authenticated, don't render the dashboard (handled by the redirect)
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <span>Benvenuto, <span className="font-semibold">{user.username}</span></span>
              {user.avatar && (
                <img 
                  src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`} 
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          )}
        </div>
        
        <Tabs defaultValue="roulette" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="roulette">Egirl Roulette</TabsTrigger>
            <TabsTrigger value="lookup">Ricerca Discord ID</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roulette" className="mt-0">
            <EgirlRoulette />
          </TabsContent>
          
          <TabsContent value="lookup" className="mt-0">
            <DiscordUserLookup />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nashi Hub. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}