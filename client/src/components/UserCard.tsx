import { DiscordUser } from "@/types/discord";
import { formatTimeAgo } from "@/lib/utils";

interface UserCardProps {
  user: DiscordUser;
  createdAt: string;
  accountAge: string;
}

export default function UserCard({ user, createdAt, accountAge }: UserCardProps) {
  // Construct avatar URL
  const avatarUrl = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256` 
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  return (
    <div className="bg-[#36393F] rounded-lg overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* User Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#2F3136]">
            <img 
              src={avatarUrl} 
              alt={`${user.username}'s avatar`} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* User Details */}
          <div className="flex-grow text-center sm:text-left">
            <h3 className="text-xl font-bold text-white mb-1">
              {user.username}{user.discriminator !== "0" ? `#${user.discriminator}` : ''}
            </h3>
            <p className="text-[#B9BBBE] mb-3">ID: {user.id}</p>
            
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[#B9BBBE] font-medium">Account Created:</span>
                <span className="text-white">{createdAt}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[#B9BBBE] font-medium">Account Age:</span>
                <span className="text-white">{accountAge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional User Info */}
      <div className="bg-[#2F3136] px-6 py-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#B9BBBE]">Information retrieved from Discord API</span>
          <span className="text-sm text-[#B9BBBE]">{formatTimeAgo(new Date())}</span>
        </div>
      </div>
    </div>
  );
}
