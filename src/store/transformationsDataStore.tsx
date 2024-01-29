import {create} from 'zustand'

interface TransformationsDataStore {
    isApplyingText: boolean;
    setIsApplyingText: (val: boolean) => void;
    textPositionListener: ((e: any) => void) | null;
    setTextPositionListener: (fn: ((e: any) => void) | null) => void;
    textColor: string;
    setTextColor: (color: string) => void;
    borderColor: string;
    setBorderColor: (color: string) => void;
}

export const useTransformationsDataStore = create<TransformationsDataStore>()((set) => ({
    isApplyingText: false,
    setIsApplyingText: (val: boolean) => set(() => ({isApplyingText: val})),
    textPositionListener: null,
    setTextPositionListener: (listener: ((e: any) => void) | null) => set(() => ({textPositionListener: listener})),
    textColor: "#00ff00",
    setTextColor: (color: string) => set(() => ({textColor: color})),
    borderColor: "#00ff00",
    setBorderColor: (color: string) => set(() => ({borderColor: color})),
}));