import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export function calculateAccountAge(timestamp: number): string {
  const creationDate = new Date(timestamp);
  const now = new Date();
  
  // Calculate difference in years and months
  let years = now.getFullYear() - creationDate.getFullYear();
  let months = now.getMonth() - creationDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Format the age string
  let ageString = '';
  
  if (years > 0) {
    ageString += `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  if (months > 0) {
    ageString += `${years > 0 ? ', ' : ''}${months} month${months !== 1 ? 's' : ''}`;
  }
  
  if (years === 0 && months === 0) {
    ageString = 'Less than a month';
  }
  
  return ageString;
}

// Function to convert Discord Snowflake ID to timestamp
export function getTimestampFromSnowflake(snowflake: string): number {
  // Discord epoch (January 1, 2015)
  const DISCORD_EPOCH = 1420070400000;
  
  // Convert the snowflake to a BigInt to handle large numbers properly
  const id = BigInt(snowflake);
  
  // Shift right 22 bits to get the timestamp
  const timestamp = Number((id >> 22n)) + DISCORD_EPOCH;
  
  return timestamp;
}
