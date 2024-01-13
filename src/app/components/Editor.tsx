"use client";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {Button} from "@/components/ui/button";

import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {FieldValues, useForm} from "react-hook-form";
import {HexColorPicker} from "react-colorful";

export default function Editor() {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [sourceImageURL, setSourceImageURL] = useState<string | null>(null);
    const [imageFormat, setImageFormat] = useState<string | null>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [image, setImage] = useState<Uint8Array | null>(null);
    const ffmpegRef = useRef(new FFmpeg());
    const [textColor, setTextColor] = useState("#0000ff");

    const [imageCursorPosition, setImageCursorPosition] = useState<{x: number, y: number} | null>(null);

    const {register, handleSubmit} = useForm();
    const [data, setData] = useState<FieldValues | null>(null);

    const [isApplyingText, setIsApplyingText] = useState<boolean>(false);

    const followDivRef = useRef<HTMLDivElement | null>(null);

    const [textPositionListener, setTextPositionListener] = useState<((e: any) => void) | null>(null);

    const handleTextApplyClick = (event: MouseEvent) => {
        setIsApplyingText(true);
        const x = event.clientX;
        console.log("outer: ", x)

        const textPositionListener = (e) => {
            const x = e ? e.clientX : event.clientX;
            const y = e ? e.clientY : event.clientY;
            console.log("inner: ", x)

            if (followDivRef.current) {
                followDivRef.current.style.top = `${y}px`;
                followDivRef.current.style.left = `${x}px`;
            }
        }

        window.addEventListener("mousemove", textPositionListener, false);
        setTextPositionListener(textPositionListener);
    }

    const addText = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(["-i", `input.${imageFormat}`, "-vf", `drawtext=fontfile=./OpenSans-LightItalic.ttf:text=${data?.text ?? "Sample Text"}:x=${imageCursorPosition!.x}:y=${imageCursorPosition!.y}:fontsize=40:fontcolor=#00ff00`, `output.${imageFormat}`, "-loglevel", "debug"])
        await cleanUp();

        window.removeEventListener("mousemove", textPositionListener!, false);
        setTextPositionListener(null);
        setIsApplyingText(false);
    }

    const applyTextToImage = async (e: MouseEvent) => {
        console.log("applyTextToImage runs");

        const rect = (e.target as HTMLImageElement)!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(["-i", `input.${imageFormat}`, "-vf", `drawtext=fontfile=./OpenSans-LightItalic.ttf:text=${data?.text ?? "Sample Text"}:x=${x}:y=${y}:fontsize=40:fontcolor=#00ff00`, `output.${imageFormat}`, "-loglevel", "debug"])

        window.removeEventListener("mousemove", textPositionListener!, false);
        setTextPositionListener(null);
        setIsApplyingText(false);

        await cleanUp();
    }

    const getPosition = (e: MouseEvent) => {
        const rect = (e.target as HTMLImageElement)!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setImageCursorPosition({x, y});
    };

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({message}) => {
            console.log(message);
        });

        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        });

        setIsLoaded(true);
    }


    const initialize = async (e: ChangeEvent) => {
        const file = (e.target as HTMLInputElement)!.files![0];

        const format = file.type.split("/")[1];
        setImageFormat(format);

        const fileData = await fetchFile(file);
        const ffmpeg = ffmpegRef.current;

        await ffmpeg.writeFile(`input.${format}`, fileData);

        await ffmpeg.writeFile("OpenSans-LightItalic.ttf", await fetchFile("http://localhost:3000/fonts/OpenSans-LightItalic.ttf"));

        ffmpeg.readFile(`input.${format}`).then((imageData) => {
            const imageURL = URL.createObjectURL(new Blob([imageData], {type: `image/${format}`}));
            setSourceImageURL(imageURL);
        });

        console.log(await ffmpeg.listDir("/"));

        setImage(fileData);
    }

    const cleanUp = async () => {
        const ffmpeg = ffmpegRef.current;
        const data = await ffmpeg.readFile(`output.${imageFormat}`);
        const imageURL = URL.createObjectURL(new Blob([data], { type: `image/${imageFormat}` }));
        await ffmpeg.listDir("/");
        await ffmpeg.deleteFile(`input.${imageFormat}`);
        await ffmpeg.rename(`output.${imageFormat}`, `input.${imageFormat}`);
        setSourceImageURL(imageURL);
    }

    const greyScale = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-i input.${imageFormat} -vf hue=s=0 output.${imageFormat}`.split(" "));
        await cleanUp();
    }

    const ImageDisplay = () => {
        return (
            <img
                ref={imageRef}
                src={sourceImageURL!}
                alt={"Image to Edit"}
                onClick={async (e) => {
                    await applyTextToImage(e);
                }}
            />
        );
    };

    return (isLoaded && image) ? (
        <div>
            <p ref={messageRef}></p>
            <ImageDisplay/>
            <Button onClick={() => {greyScale();}}>Grayscale</Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Add text</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add text to image</DialogTitle>
                        <DialogDescription>
                            Select text color, add text, select fonts.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <form onSubmit={handleSubmit((data) => {
                                setData(data);
                            })}>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Text</Label>
                                        <Input {...register("text")} id="text" placeholder="Sample Text" required type="text" />
                                    </div>
                                    <div className="flex gap-x-4">
                                        <HexColorPicker color={textColor} onChange={setTextColor} />
                                        <div className="flex w-full h-full justify-center align-center">
                                            <div className={"w-full h-full"} style={{color: textColor}}>{data?.text ?? "Sample Text"}</div>
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={(e) => {
                                        handleTextApplyClick(e);
                                    }}>
                                        Apply Text to image
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {isApplyingText ? (
                <div ref={followDivRef} className={"absolute top-0 left-0 pointer-events-none"}>{data?.text}</div>
            ) : null}
        </div>
        ) : (
        <div>
            <label htmlFor="file-upload" className="custom-file-upload">{image ? "Loading ffmpeg" : "Add an image to start"}</label>
            <input
                style={{display: "none"}} id="file-upload" type="file" ref={fileInputRef}
                onChange={initialize}
            />
        </div>
    )
}
