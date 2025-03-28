import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, User, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UserCard from "./UserCard";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function FriendFinder() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Query for search results
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: refetchSearch,
    isError: isSearchError,
  } = useQuery({
    queryKey: ["/api/discord/friends/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { results: [], total: 0 };
      
      const res = await apiRequest(
        "GET", 
        `/api/discord/friends/search?query=${encodeURIComponent(searchQuery)}`
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to search for friends");
      }
      
      return await res.json();
    },
    enabled: false,
  });

  // Query for selected friend details
  const {
    data: friendDetails,
    isLoading: isLoadingDetails,
    isError: isDetailsError,
  } = useQuery({
    queryKey: ["/api/discord/friends", selectedId],
    queryFn: async () => {
      if (!selectedId) return null;
      
      const res = await apiRequest("GET", `/api/discord/friends/${selectedId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch friend details");
      }
      
      return await res.json();
    },
    enabled: !!selectedId,
  });

  // Handle search submit
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a name to search for",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSearchIndex(0);
      setSelectedId(null);
      await refetchSearch();
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search for friends",
        variant: "destructive",
      });
    }
  };

  // Handle result selection
  const handleSelectFriend = () => {
    if (!searchResults?.results || searchResults.results.length === 0) return;
    
    const result = searchResults.results[searchIndex];
    setSelectedId(result.discordId);
  };

  // Handle next result
  const handleNextResult = () => {
    if (!searchResults?.results || searchResults.results.length === 0) return;
    
    setSearchIndex((prev) => (prev + 1) % searchResults.results.length);
    setSelectedId(null);
  };

  // Handle search errors
  if (isSearchError) {
    toast({
      title: "Search failed",
      description: "Failed to search for friends. Please try again.",
      variant: "destructive",
    });
  }

  // Handle details errors
  if (isDetailsError) {
    toast({
      title: "Failed to load details",
      description: "Could not load friend details. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-white">Friend Finder</h2>
        <p className="text-[#B9BBBE]">
          Search for a friend by name and view their Discord profile.
        </p>

        {/* Search Form */}
        <form 
          onSubmit={handleSearch} 
          className="flex flex-col sm:flex-row gap-3 mt-2"
        >
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#2F3136] border-[#202225] text-white pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#B9BBBE]" />
          </div>
          <Button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-700" 
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Find Friend
          </Button>
        </form>

        {/* Search Results */}
        {searchResults?.results && searchResults.results.length > 0 && (
          <div className="bg-[#2F3136] p-4 rounded-md mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#B9BBBE]" />
                <span className="text-white font-medium">
                  {searchResults.results[searchIndex].username}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {searchResults.results.length > 1 && (
                  <div className="text-sm text-[#B9BBBE]">
                    {searchResults.total > 1 && (
                      <span>
                        {searchResults.total - 1} other{" "}
                        {searchResults.total - 1 === 1 ? "match" : "matches"}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {searchResults.results.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextResult}
                      className="bg-[#36393F] border-[#202225] text-white hover:bg-[#2F3136]"
                    >
                      Next Match
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={handleSelectFriend}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchResults?.results && searchResults.results.length === 0 && (
          <div className="bg-[#2F3136] p-4 rounded-md mt-4 text-center">
            <p className="text-[#B9BBBE]">No friends found with that name.</p>
          </div>
        )}

        {/* Friend Details */}
        {isLoadingDetails && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}

        {friendDetails && (
          <div className="mt-6">
            <UserCard
              user={friendDetails.user}
              createdAt={friendDetails.created_at}
              accountAge={friendDetails.account_age}
            />
          </div>
        )}
      </div>
    </div>
  );
}