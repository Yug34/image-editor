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

export const downloadItem = (itemName: string, itemLink: string) => {
  const link = document.createElement("a");
  link.download = itemName;
  link.target = "_blank";

  link.href = itemLink;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};