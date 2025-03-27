import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import DiscordUserLookup from "@/components/DiscordUserLookup";
import EgirlRoulette from "@/components/EgirlRoulette";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("roulette");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
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