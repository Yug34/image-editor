"use client";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {Button} from "@/components/ui/button";
import { DownloadIcon } from "@radix-ui/react-icons"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Controller, useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {TextDialog} from "@/app/components/Editor/TextDialog";
import {FONTFACES} from "@/constants";
import {HexColorPicker} from "react-colorful";
import {BorderDialog} from "@/app/components/Editor/BorderDialog";

export default function Index() {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // TODO:
    // const [loaded, setLoaded] = useState(false);
    // Store image data as a Byte Array
    const [image, setImage] = useState<Uint8Array | null>(null);
    // URL to image Byte Array stored locally
    const [sourceImageURL, setSourceImageURL] = useState<string | null>(null);
    const [prevSourceImageURLs, setPrevSourceImageURLs] = useState<string[]>([]);

    useEffect(() => {
        console.log("Effect runs")
        if (prevSourceImageURLs.length > 0) {
            console.log("Effect runs inner")
            setSourceImageURL(prevSourceImageURLs[prevSourceImageURLs.length - 1]);
        }
    }, [prevSourceImageURLs]);

    const addURLToPrevList = (newURL: string) => {
        setPrevSourceImageURLs(prevState => [...prevState,newURL] );
    }

    const removeURLFromPrevList = () => {
        if (prevSourceImageURLs.length > 1) {
            setPrevSourceImageURLs(previousArr => (previousArr.slice(0, -1)));
        }
    }

    const [imageFormat, setImageFormat] = useState<string | null>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const ffmpegRef = useRef(new FFmpeg());
    const [textColor, setTextColor] = useState("#00ff00");
    const [borderColor, setBorderColor] = useState("#00ff00");

    const {control, watch} = useForm({
        mode: "onChange",
        defaultValues: {
            text: "Sample Text",
            fontSize: 24,
            fontFile: "OpenSans-Regular.ttf"
        }
    });

    const {control: borderControl, watch: borderWatch} = useForm({
        mode: "onChange",
        defaultValues: {
            borderSize: 20
        }
    });

    const [isApplyingText, setIsApplyingText] = useState<boolean>(false);

    const followDivRef = useRef<HTMLDivElement | null>(null);

    const [textPositionListener, setTextPositionListener] = useState<((e: any) => void) | null>(null);

    const [isTextDialogOpen, setIsTextDialogOpen] = useState<boolean>(false);
    const [isBorderDialogOpen, setIsBorderDialogOpen] = useState<boolean>(false);

    const downloadImage = () => {
        const link = document.createElement("a");
        link.download = `output.${imageFormat}`;
        link.target = "_blank";

        link.href = sourceImageURL!;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleTextApplyClick = (event: MouseEvent) => {
        setIsTextDialogOpen(false);
        setIsApplyingText(true);

        //@ts-ignore
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

    const applyTextToImage = async (e: MouseEvent) => {
        if (isApplyingText) {
            const rect = (e.target as HTMLImageElement)!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ffmpeg = ffmpegRef.current;

            await ffmpeg.exec(["-i", `input.${imageFormat}`, "-vf", `drawtext=fontfile=${watch("fontFile")}:text=${watch("text") ?? "Sample Text"}:x=${x}:y=${y}:fontsize=${watch("fontSize")}:fontcolor=${textColor ?? "#00ff00"}`, `output.${imageFormat}`, "-loglevel", "debug"])

            window.removeEventListener("mousemove", textPositionListener!, false);
            setTextPositionListener(null);
            setIsApplyingText(false);

            await cleanUp();
        }
    }

    const addBorderToImage = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(["-i", `input.${imageFormat}`, "-vf", `pad=${borderWatch("borderSize") * 2}+iw:${borderWatch("borderSize") * 2}+ih:${borderWatch("borderSize")}:${borderWatch("borderSize")}:${borderColor}`, `output.${imageFormat}`]);
        await cleanUp();
    }

    useEffect(() => {
        (async () => {
            await load();
            const ffmpeg = ffmpegRef.current;
            await Promise.all(FONTFACES.map(async fontFace => {
                await ffmpeg.writeFile(fontFace.file, await fetchFile(`${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://image-editor-ten-drab.vercel.app"}/fonts/${fontFace.file}`));
            }));
        })();
    }, []);

    const load = async () => {
        // FFmpeg.wasm base URL:
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

        ffmpeg.readFile(`input.${format}`).then((imageData) => {
            const imageURL = URL.createObjectURL(new Blob([imageData], {type: `image/${format}`}));
            addURLToPrevList(imageURL);
        });

        setImage(fileData);
    }

    const cleanUp = async () => {
        const ffmpeg = ffmpegRef.current;
        const data = await ffmpeg.readFile(`output.${imageFormat}`);
        const imageURL = URL.createObjectURL(new Blob([data], {type: `image/${imageFormat}`}));
        addURLToPrevList(imageURL);
        await ffmpeg.deleteFile(`input.${imageFormat}`);
        await ffmpeg.rename(`output.${imageFormat}`, `input.${imageFormat}`);
    }

    const greyScale = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-i input.${imageFormat} -vf hue=s=0 output.${imageFormat}`.split(" "));
        await cleanUp();
    }

    return (isLoaded && image) ? (
        <div className={"flex flex-col w-full h-full justify-center items-center"}>
            <p ref={messageRef}></p>
            <Card className={"p-0"}>
                <CardHeader className={"p-0"}>
                    <CardTitle className={"flex mb-4 border-b"}>
                        <Button
                            className={"rounded-none rounded-tl-lg border-none"}
                            variant={"outline"}
                            onClick={greyScale}
                        >
                            Greyscale Image
                        </Button>
                        <BorderDialog
                            isBorderDialogOpen={isBorderDialogOpen}
                            setIsBorderDialogOpen={setIsBorderDialogOpen}
                            borderControl={borderControl}
                            borderColor={borderColor}
                            setBorderColor={setBorderColor}
                            addBorderToImage={addBorderToImage}
                        />
                        <TextDialog
                            isTextDialogOpen={isTextDialogOpen}
                            setIsTextDialogOpen={setIsTextDialogOpen}
                            control={control}
                            textColor={textColor}
                            setTextColor={setTextColor}
                            text={watch("text")}
                            fontSize={watch("fontSize")}
                            handleTextApplyClick={handleTextApplyClick}
                        />
                        <Button
                            onClick={removeURLFromPrevList}
                            variant={"outline"}
                        >
                            Undo
                        </Button>
                        <Button
                            className={"ml-auto rounded-none rounded-tr-lg border-y-0 border-r-0 border-l"}
                            variant={"outline"}
                            onClick={downloadImage}
                        >
                            Download Image
                            <DownloadIcon className={"ml-2"} />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <img
                        ref={imageRef}
                        src={sourceImageURL!}
                        alt={"Image to Edit"}
                        onClick={async (e) => {
                            //@ts-ignore
                            await applyTextToImage(e);
                        }}
                    />
                </CardContent>
            </Card>
            <div className={"flex gap-x-8 mt-8"}>
            </div>
            {isApplyingText ? (
                <div
                    ref={followDivRef}
                    style={{fontSize: `${watch("fontSize")}px`, color: textColor}}
                    className={`absolute top-0 left-0 pointer-events-none`}
                >
                    {watch("text")}
                </div>
            ) : null}
        </div>
    ) : (
        <div className={"flex flex-col h-full justify-center items-start"}>
            <Label htmlFor="file-upload" className={"mb-4 ml-2"}>
                {image ? "Loading ffmpeg" : "Add an image to start"}
            </Label>
            <Input
                // style={{display: "none"}}
                className={"w-[300px]"}
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={initialize}
            />
        </div>
    )
}
