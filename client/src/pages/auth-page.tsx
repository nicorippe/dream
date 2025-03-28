import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Redirect } from "wouter";
import { SiDiscord } from "react-icons/si";

export default function AuthPage() {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isLoggedIn) {
    return <Redirect to="/dashboard" />;
  }

  const handleDiscordLogin = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="flex min-h-screen">
      {/* Auth side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Nashi Hub</CardTitle>
            <CardDescription>
              Accedi con il tuo account Discord per continuare
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                <p className="text-center text-sm text-muted-foreground px-4">
                  Per utilizzare tutte le funzionalità di Nashi Hub, è necessario accedere con il tuo account Discord.
                </p>
                
                <Button 
                  className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white mt-4"
                  onClick={handleDiscordLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connessione con Discord...
                    </>
                  ) : (
                    <>
                      <SiDiscord className="mr-2 h-4 w-4" />
                      Accedi con Discord
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Non condivideremo i tuoi dati Discord con terze parti
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Hero section */}
      <div className="hidden md:block w-1/2 bg-gradient-to-br from-purple-600 to-pink-500 p-12 text-white flex flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">Benvenuto su Nashi Hub</h1>
          <p className="text-xl mb-8">
            La tua piattaforma per scoprire e ottenere informazioni sugli utenti Discord.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Egirl Roulette</h3>
                <p className="text-white/80">Scopri profili Discord casuali con informazioni dettagliate</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Ricerca Discord ID</h3>
                <p className="text-white/80">Trova informazioni dettagliate su qualsiasi utente Discord tramite ID</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Friend Finder</h3>
                <p className="text-white/80">Cerca e trova amici su Discord con facilità</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}