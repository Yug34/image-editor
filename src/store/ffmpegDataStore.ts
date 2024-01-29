import {create} from 'zustand'
import {FFmpeg} from "@ffmpeg/ffmpeg";

interface FfmpegDataDataStore {
    FFmpeg: FFmpeg,
    isFFmpegLoaded: boolean;
    setIsFFmpegLoaded: (val: boolean) => void;
}

export const useFfmpegDataStore = create<FfmpegDataDataStore>()((set) => ({
    FFmpeg: new FFmpeg(),
    isFFmpegLoaded: false,
    setIsFFmpegLoaded: (val: boolean) => set(() => ({isFFmpegLoaded: val})),
}));