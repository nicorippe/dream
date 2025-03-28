import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { DiscordUser } from "@/types/discord";
import { apiRequest } from "@/lib/queryClient";
import UserCard from "@/components/UserCard";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("roulette");
  const { isLoggedIn, isLoading, user } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setLocation("/?auth=required");
    }
  }, [isLoading, isLoggedIn, setLocation]);
  
  // Query for history data
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/user/history", activeTab],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/user/history/${activeTab}`);
      if (!res.ok) {
        throw new Error("Failed to load history data");
      }
      const data = await res.json();
      return data.history || [];
    },
    enabled: isLoggedIn && !!user,
  });

  // Query for user details
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: userDetail, isLoading: isLoadingUserDetail } = useQuery({
    queryKey: ["/api/discord/users", selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      
      const res = await apiRequest("GET", `/api/discord/users/${selectedId}`);
      if (!res.ok) {
        throw new Error("Failed to load user details");
      }
      return await res.json();
    },
    enabled: !!selectedId,
  });
  
  // Convert type to Italian label
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'roulette': return 'Egirl Roulette';
      case 'lookup': return 'Ricerca Discord ID';
      case 'friend': return 'Friend Finder';
      default: return type;
    }
  };
  
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
  
  // If not authenticated, don't render the page (handled by the redirect)
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Cronologia</h1>
          <button
            onClick={() => setLocation("/dashboard")}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Torna alla Dashboard
          </button>
        </div>
        
        <Tabs defaultValue="roulette" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="roulette">Egirl Roulette</TabsTrigger>
            <TabsTrigger value="lookup">Ricerca Discord ID</TabsTrigger>
            <TabsTrigger value="friend">Friend Finder</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <div className="bg-[#36393F] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">
                Statistiche {getTypeLabel(activeTab)}
              </h2>
              
              {isLoadingHistory ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ) : (
                <>
                  <p className="text-[#B9BBBE] mb-2">
                    {historyData?.length || 0} {activeTab === 'roulette' ? 'persone rollate' :
                      activeTab === 'lookup' ? 'ID cercati' : 'amici cercati'}
                  </p>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-semibold mb-3 text-[#B9BBBE]">Elenco ID:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {historyData && historyData.length > 0 ? (
                        historyData.map((id: string, index: number) => (
                          <div
                            key={`${id}-${index}`}
                            className="bg-[#2F3136] p-3 rounded-md cursor-pointer hover:bg-[#292b2f]"
                            onClick={() => setSelectedId(id)}
                          >
                            <p className="text-sm font-mono text-white truncate">
                              {id}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#B9BBBE] col-span-full">
                          Nessun record trovato per questa categoria.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Selected User Details */}
            {selectedId && (
              <div className="bg-[#36393F] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Dettagli Utente</h2>
                
                {isLoadingUserDetail ? (
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : userDetail ? (
                  <UserCard
                    user={userDetail.user}
                    createdAt={userDetail.created_at}
                    accountAge={userDetail.account_age}
                  />
                ) : (
                  <p className="text-[#B9BBBE]">
                    Impossibile caricare i dettagli dell'utente.
                  </p>
                )}
              </div>
            )}
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