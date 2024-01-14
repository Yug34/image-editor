import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// const isFontLoaded = async (fontToCheck: string) => {
//     const ffmpeg = ffmpegRef.current;
//     const directories = await ffmpeg.listDir("/")
//     return directories.filter((dir) => dir.name === fontToCheck).length === 1;
// }