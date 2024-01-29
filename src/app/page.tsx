"use client";
import Editor from "@/app/components/Editor";
import { Navbar } from "@/app/components/Navbar";
import {useFfmpegDataStore} from "@/store/ffmpegDataStore";
import ImageUpload from "@/app/components/ImageUpload";
import {useEffect, useRef} from "react";
import {useImageDataStore} from "@/store/imageDataStore";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {FONTFACES} from "@/constants";

export default function Home() {
  const {isFFmpegLoaded, FFmpeg, setIsFFmpegLoaded} = useFfmpegDataStore();
  const {image} = useImageDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFFmpegBinaries = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    FFmpeg.on('log', ({message}) => {
      console.log(message);
    });

    // toBlobURL is used to bypass CORS issue, urls with the same domain can be used directly.
    await FFmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    });

    setIsFFmpegLoaded(true);
  }

  useEffect(() => {
    (async () => {
      await loadFFmpegBinaries();
      await Promise.all(FONTFACES.map(async fontFace => {
        await FFmpeg.writeFile(fontFace.file, await fetchFile(`${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://image-editor-yug34.vercel.app/"}/fonts/${fontFace.file}`));
      }));
    })();
  }, []);

  return (
    <div
      className={"flex flex-col h-screen w-screen items-center justify-center"}
    >
      <Navbar />
      {(isFFmpegLoaded && image) ? (
        <Editor />
        ) : (
        <ImageUpload fileInputRef={fileInputRef} />
      )}
    </div>
  );
}
