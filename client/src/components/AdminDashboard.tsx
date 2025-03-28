import { useState, FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCheck, Shield, Coins } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targetDiscordId, setTargetDiscordId] = useState("");
  const [amount, setAmount] = useState<number>(0);

  // Check if the user is an admin
  if (!user?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-bold">Admin Access Required</h2>
        <p className="text-muted-foreground text-center">
          You need admin privileges to access this dashboard.
        </p>
      </div>
    );
  }

  // Update balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ targetId, balanceAmount }: { targetId: string; balanceAmount: number }) => {
      const res = await apiRequest("POST", "/api/admin/update-balance", {
        targetDiscordId: targetId,
        amount: balanceAmount,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update balance");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Balance updated for user ${targetDiscordId}`,
      });
      
      // Clear form
      setTargetDiscordId("");
      setAmount(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!targetDiscordId) {
      toast({
        title: "Error",
        description: "Please enter a Discord ID",
        variant: "destructive",
      });
      return;
    }
    
    updateBalanceMutation.mutate({
      targetId: targetDiscordId,
      balanceAmount: amount,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="ml-2">
          Admin
        </Badge>
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Manage User Balance</CardTitle>
          <CardDescription>
            Add or remove coins from any user's account by their Discord ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discord-id">Discord ID</Label>
              <Input
                id="discord-id"
                placeholder="Enter Discord ID"
                value={targetDiscordId}
                onChange={(e) => setTargetDiscordId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (positive to add, negative to subtract)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateBalanceMutation.isPending}
            >
              {updateBalanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Updating...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" /> 
                  Update Balance
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <UserCheck className="mr-2 h-4 w-4" />
          Only users who have logged in at least once can be updated
        </CardFooter>
      </Card>
    </div>
  );
}