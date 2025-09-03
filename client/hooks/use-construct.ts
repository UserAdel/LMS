import { env } from "@/lib/env";

export function useContructUrl(key: string, isVideo?: boolean): string {
  // Check if it's a video file by extension or explicit parameter
  const hasVideoExtension = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(key);
  const shouldUseVideoApi = isVideo || hasVideoExtension;
  
  // Properly encode the key to handle special characters
  const encodedKey = encodeURIComponent(key);
  
  if (shouldUseVideoApi) {
    // Route video files through authenticated API
    return `/api/video/${encodedKey}`;
  }
  
  // Route all other files (images) through authenticated API since Tigris is now private
  return `/api/image/${encodedKey}`;
}
