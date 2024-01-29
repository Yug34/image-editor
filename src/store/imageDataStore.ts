import {create} from 'zustand'

interface ImageDataStoreState {
    image: Uint8Array | null; // Store image data as a Byte Array
    setImage: (image: Uint8Array) => void;
    sourceImageURL: string | null; // URL to the image Byte Array blob above ^
    setSourceImageURL: (url: string) => void;
    prevSourceImageURLs: string[]; // Array to keep track of URLs to previous images in memory
    setPrevSourceImageURLs: (urls: string[]) => void;
    imageFormat: string | null; // Storing image format, JPG/JPEG/PNG.
    setImageFormat: (format: string) => void;
    imageDimensions: {
        x: number,
        y: number
    },
    setImageDimensions: ({x, y}: {x: number, y: number}) => void;
}

export const useImageDataStore = create<ImageDataStoreState>()((set) => ({
    image: null,
    setImage: (image: Uint8Array) => set(() => ({image: image})),
    sourceImageURL: null,
    setSourceImageURL: (url: string) => set(() => ({sourceImageURL: url})),
    prevSourceImageURLs: [],
    setPrevSourceImageURLs: (urls: string[]) => set(() => ({prevSourceImageURLs: urls})),
    imageFormat: null,
    setImageFormat: (imageFormat: string) => set(() => ({imageFormat: imageFormat})),
    imageDimensions: {
        x: 0,
        y: 0
    },
    setImageDimensions: ({x, y}: {x: number, y: number}) => set(() => ({
        imageDimensions: {
            x: x,
            y: y
        }
    }))
}));