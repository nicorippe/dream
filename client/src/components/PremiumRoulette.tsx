import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DiscordUser } from "@/types/discord";
import UserCard from "@/components/UserCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, Filter, RefreshCw, Coins } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PremiumRoulette() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [createdAt, setCreatedAt] = useState("");
  const [accountAge, setAccountAge] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterYear, setFilterYear] = useState<string>("any");
  const [rollsAvailable, setRollsAvailable] = useState(true);
  
  // Balance management
  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ["/api/user/balance"],
    queryFn: async () => {
      const res = await fetch("/api/user/balance");
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
    enabled: !!user,
  });
  
  // Update balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/balance/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: -1 }), // Deduct 1 coin
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to use balance");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Refresh the balance
      queryClient.invalidateQueries({ queryKey: ["/api/user/balance"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Check if user has enough balance
  useEffect(() => {
    if (balanceData) {
      setRollsAvailable((balanceData.balance || 0) > 0);
    }
  }, [balanceData]);
  
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let year = 2015; year <= currentYear; year++) {
    availableYears.push(year.toString());
  }
  
  const fetchRandomUser = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the roulette feature.",
        variant: "destructive",
      });
      return;
    }
    
    if (!rollsAvailable) {
      toast({
        title: "Insufficient Balance",
        description: "You need at least 1 coin to use Premium Roulette.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // First deduct a coin
      await updateBalanceMutation.mutateAsync();
      
      // Then roll for a user
      const params = new URLSearchParams();
      if (filterYear && filterYear !== "any") params.append("year", filterYear);
      
      const url = `/api/discord/roulette?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch random user");
      }
      
      const data = await response.json();
      
      if (data.user) {
        setDiscordUser(data.user);
        setCreatedAt(data.created_at || "Unknown");
        setAccountAge(data.account_age || "Unknown");
        
        // No need to record this explicitly, the server does it already
      } else {
        toast({
          title: "No Users Found",
          description: "No users match your filter criteria. Try different filters.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching random user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch random user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Refresh the balance
      refetchBalance();
    }
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const resetFilters = () => {
    setFilterYear("any");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CardTitle className="mr-2">Premium Roulette</CardTitle>
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                className="flex items-center"
              >
                <Filter className="mr-1 h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center"
                disabled={filterYear === "any" || !filterYear}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          <CardDescription>
            Use your coins for premium features! Each roll costs 1 coin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="bg-secondary/30 p-4 rounded-lg mb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="year-filter">Filter by Creation Year</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any year</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {discordUser ? (
            <UserCard user={discordUser} createdAt={createdAt} accountAge={accountAge} />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center bg-muted/30">
              <Star className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Roulette</h3>
              <p className="text-muted-foreground mb-4">
                Use 1 coin per roll to access special filtering options!
              </p>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Coins className="h-4 w-4 mr-1" />
                <span>Your Balance: {balanceData?.balance || 0} coins</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            Coins: {balanceData?.balance || 0}
          </div>
          <Button 
            onClick={fetchRandomUser} 
            disabled={loading || !rollsAvailable}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rolling...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Spin (1 coin)
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}