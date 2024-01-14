"use client";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {Button} from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Controller, FieldValues, useForm} from "react-hook-form";
import {HexColorPicker} from "react-colorful";
import {FONTFACES} from "@/constants";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent, SelectGroup,
    SelectItem, SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Editor() {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // TODO:
    // const [loaded, setLoaded] = useState(false);
    const [sourceImageURL, setSourceImageURL] = useState<string | null>(null);
    const [imageFormat, setImageFormat] = useState<string | null>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [image, setImage] = useState<Uint8Array | null>(null);
    const ffmpegRef = useRef(new FFmpeg());
    const [textColor, setTextColor] = useState("#0000ff");

    const {handleSubmit, getValues, control, watch} = useForm({
        mode: "onChange",
        defaultValues: {
            text: "Sample Text",
            fontSize: 24,
            fontFile: "OpenSans-LightItalic.ttf"
        }
    });
    const [data, setData] = useState<FieldValues | null>(null);

    const [isApplyingText, setIsApplyingText] = useState<boolean>(false);

    const followDivRef = useRef<HTMLDivElement | null>(null);

    const [textPositionListener, setTextPositionListener] = useState<((e: any) => void) | null>(null);

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const handleTextApplyClick = (event: MouseEvent) => {
        setDialogOpen(false);
        setIsApplyingText(true);

        const textPositionListener = (e) => {
            const x = e ? e.clientX : event.clientX;
            const y = e ? e.clientY : event.clientY;

            if (followDivRef.current) {
                followDivRef.current.style.top = `${y - 8}px`;
                followDivRef.current.style.left = `${x}px`;
            }
        }

        window.addEventListener("mousemove", textPositionListener, false);
        setTextPositionListener(textPositionListener);
    }

    const isFontLoaded = async (fontToCheck: string) => {
        const ffmpeg = ffmpegRef.current;
        const directories = await ffmpeg.listDir("/")
        return directories.filter((dir) => dir.name === fontToCheck).length === 1;
    }

    const applyTextToImage = async (e: MouseEvent) => {
        if (isApplyingText) {
            const rect = (e.target as HTMLImageElement)!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ffmpeg = ffmpegRef.current;

            if (!await isFontLoaded(watch("fontFile"))) {
                await ffmpeg.writeFile(watch("fontFile"), await fetchFile(`http://localhost:3000/fonts/${watch("fontFile")}`));
            }

            await ffmpeg.exec(["-i", `input.${imageFormat}`, "-vf", `drawtext=fontfile=${watch("fontFile")}:text=${watch("text") ?? "Sample Text"}:x=${x}:y=${y}:fontsize=${watch("fontSize")}:fontcolor=${textColor ?? "#00ff00"}`, `output.${imageFormat}`, "-loglevel", "debug"])

            window.removeEventListener("mousemove", textPositionListener!, false);
            setTextPositionListener(null);
            setIsApplyingText(false);
    
            await cleanUp();
        }
    }

    const addBorderToImage = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-i input.${imageFormat} -vf "pad=50+iw:50+ih:25:25" output.${imageFormat}`.split(" "));
        await cleanUp();
    }

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
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

    return (isLoaded && image) ? (
        <div>
            <p ref={messageRef}></p>
            <img
                ref={imageRef}
                src={sourceImageURL!}
                alt={"Image to Edit"}
                onClick={async (e) => {
                    await applyTextToImage(e);
                }}
            />
            <Button onClick={() => {greyScale();}}>Grayscale</Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                                        <Controller
                                            control={control}
                                            name="text"
                                            render={({ field }) => {
                                                return <Input {...field} placeholder={"Sample Text"} required type={"text"} />
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Controller
                                            control={control}
                                            name="fontSize"
                                            render={({ field }) => {
                                                return (
                                                    <Input
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        required
                                                        placeholder={"Font size in px"}
                                                        type={"number"}
                                                    />
                                                );
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Controller
                                            control={control}
                                            name="fontFile"
                                            render={({ field }) => {
                                                return (
                                                    <select {...field}>
                                                        {FONTFACES.map((fontFace) => (
                                                            <option key={fontFace.display} value={fontFace.file}>{fontFace.display}</option>
                                                        ))}
                                                    </select>
                                                );
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-y-4 colorPickerParent">
                                        <div className="w-full h-full" style={{color: textColor, fontSize: watch("fontSize")}}>{watch("text")}</div>
                                        <HexColorPicker color={textColor} onChange={setTextColor} />
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
                </DialogContent>
            </Dialog>
            {isApplyingText ? (
                <div ref={followDivRef} style={{fontSize: `${watch("fontSize")}px`, color: textColor}} className={`absolute top-0 left-0 pointer-events-none`}>{watch("text")}</div>
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
