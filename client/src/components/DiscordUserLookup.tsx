import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DiscordApiResponse, DiscordApiError } from "@/types/discord";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserCard from "@/components/UserCard";

export default function DiscordUserLookup() {
  const [discordId, setDiscordId] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);

  const { mutate, isPending, isError, error, data } = useMutation<
    DiscordApiResponse,
    DiscordApiError,
    string
  >({
    mutationFn: async (id: string) => {
      const response = await apiRequest("GET", `/api/discord/users/${id}`, undefined);
      return response.json();
    },
  });

  const isValidDiscordId = (id: string) => {
    return /^\d{17,19}$/.test(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscordId(value);
    
    if (value && !isValidDiscordId(value)) {
      setValidationError("Please enter a valid Discord ID");
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!discordId) {
      setValidationError("Please enter a Discord ID");
      return;
    }
    
    if (!isValidDiscordId(discordId)) {
      setValidationError("Please enter a valid Discord ID");
      return;
    }
    
    setValidationError("");
    setShowInstructions(false);
    mutate(discordId);
  };

  return (
    <>
      {/* Search Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center text-white">Enter a Discord User ID</h2>
        <p className="text-[#B9BBBE] text-center mb-6">Find information about any Discord user by entering their ID below</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow relative">
            <Input
              type="text"
              value={discordId}
              onChange={handleInputChange}
              placeholder="Enter Discord User ID (e.g., 123456789012345678)"
              className="w-full bg-[#2F3136] text-white border border-gray-700 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent transition-all h-12"
            />
            {validationError && (
              <div className="text-[#ED4245] text-sm mt-1">{validationError}</div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isPending || !!validationError}
            className="bg-[#5865F2] hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 h-12"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Loading Spinner */}
      {isPending && (
        <div className="flex justify-center my-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5865F2]"></div>
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="bg-[#ED4245] bg-opacity-20 border border-[#ED4245] rounded-md p-4 my-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-[#ED4245] mr-3" />
            <div>
              <p className="text-[#ED4245] text-sm font-medium">{error?.message || "An error occurred while fetching user data."}</p>
            </div>
          </div>
        </div>
      )}

      {/* User Card */}
      {data && <UserCard user={data.user} createdAt={data.created_at} accountAge={data.account_age} />}

      {/* Instructions Panel */}
      {(showInstructions || isError) && (
        <div className="mt-10 bg-[#2F3136] rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">How to find a Discord User ID</h3>
          <ol className="list-decimal list-inside space-y-3 text-[#B9BBBE]">
            <li>Open Discord and go to User Settings (gear icon)</li>
            <li>Go to Advanced and enable Developer Mode</li>
            <li>Right-click on any user and select "Copy ID"</li>
            <li>Paste the ID in the search box above</li>
          </ol>
        </div>
      )}
    </>
  );
}
