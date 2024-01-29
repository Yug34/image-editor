import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {FFmpeg} from "@ffmpeg/ffmpeg";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// const isFontLoaded = async (fontToCheck: string) => {
//     const ffmpeg = ffmpegRef.current;
//     const directories = await ffmpeg.listDir("/")
//     return directories.filter((dir) => dir.name === fontToCheck).length === 1;
// }

export const findFFmpegLogFile = (files: {name: string; isDir: boolean;}[]): {
  isFileFound: boolean;
  fileName: string | null;
} => {
  let isFileFound = false;
  let fileName = null;

  files.forEach((file) => {
    if (file.name.includes(".log")) {
      isFileFound = true;
      fileName = file.name;
      return;
    }
  });

  return {
    isFileFound,
    fileName
  };
}

export const readImageDimensions = async (ffmpeg: FFmpeg, imageFile: string): Promise<{x: number; y: number;}> => {
  await ffmpeg.exec(['-i', imageFile, "-report"]); // generate report/logfile to get resolution
  const logFileName = findFFmpegLogFile(await ffmpeg.listDir("/")).fileName;

  let dimensions = {
    x: 0,
    y: 0
  }

  await ffmpeg.readFile(logFileName!).then(async (data) => {
    const blob = new Blob([data]);
    const fileContent = await blob.text();
    const dim = fileContent.match(/(\d+x\d+)/g)![0].split("x").map(res => parseInt(res));

    dimensions = {
      x: dim[0],
      y: dim[1]
    }
  });

  return dimensions;
}

export const downloadItem = (itemName: string, itemLink: string) => {
  const link = document.createElement("a");
  link.download = itemName;
  link.target = "_blank";

  link.href = itemLink;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};