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
    
  // Construct banner URL if present
  const bannerUrl = user.banner 
    ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024` 
    : null;
    
  // Banner background color if no banner image is present
  const bannerColorStyle = !bannerUrl && user.accent_color 
    ? { backgroundColor: `#${user.accent_color.toString(16).padStart(6, '0')}` } 
    : { backgroundColor: '#2F3136' };

  return (
    <div className="bg-[#36393F] rounded-lg overflow-hidden shadow-lg">
      {/* User Banner */}
      <div 
        className="w-full h-32 relative bg-[#2F3136]" 
        style={bannerUrl ? {} : bannerColorStyle}
      >
        {bannerUrl && (
          <img 
            src={bannerUrl} 
            alt={`${user.username}'s banner`} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="p-6 relative">
        {/* User Avatar - positioned on top of banner */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-[#2F3136] absolute -top-12 left-6 border-4 border-[#36393F]">
          <img 
            src={avatarUrl} 
            alt={`${user.username}'s avatar`} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* User Details - with margin to make space for avatar */}
        <div className="flex-grow ml-0 sm:ml-32 pt-14 sm:pt-0 text-center sm:text-left">
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
