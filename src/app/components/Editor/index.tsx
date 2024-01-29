"use client";
import {useEffect, useRef, useState} from "react";
import {fetchFile} from "@ffmpeg/util";
import {Button} from "@/components/ui/button";
import {DownloadIcon, Pencil2Icon, TransparencyGridIcon} from "@radix-ui/react-icons"

import {useForm} from "react-hook-form";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {TextDialog} from "@/app/components/Editor/TextDialog";
import {BorderDialog} from "@/app/components/Editor/BorderDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {UndoEditCTA} from "@/app/components/Editor/UndoEditCTA";
import {downloadItem} from "@/lib/utils";
import {FloatingText} from "@/app/components/Editor/FloatingText";
import {useImageDataStore} from "@/store/imageDataStore";
import {useTransformationsDataStore} from "@/store/transformationsDataStore";
import {useFfmpegDataStore} from "@/store/ffmpegDataStore";

export default function Editor() {
    const imageRef = useRef<HTMLImageElement | null>(null);

    const {
        sourceImageURL,
        setSourceImageURL,
        prevSourceImageURLs,
        setPrevSourceImageURLs,
        imageFormat,
        imageDimensions,
        addURLToPrevList
    } = useImageDataStore();

    const followDivRef = useRef<HTMLDivElement | null>(null);
    const {FFmpeg} = useFfmpegDataStore();

    useEffect(() => {
        // Set sourceImageURL to the last image in prevSourceImageURLs
        if (prevSourceImageURLs.length > 0) {
            setSourceImageURL(prevSourceImageURLs[prevSourceImageURLs.length - 1]);
        }
    }, [prevSourceImageURLs, setSourceImageURL]);

    // remove URL at the end of prevSourceImageURLs, remove associated image from WASM memory
    const removeURLFromPrevList = async () => {
        if (prevSourceImageURLs.length > 1) {
            await FFmpeg!.deleteFile(`input.${imageFormat}`);
            await FFmpeg!.writeFile(`input.${imageFormat}`, await fetchFile(prevSourceImageURLs[prevSourceImageURLs.length - 2]));

            setPrevSourceImageURLs(prevSourceImageURLs.slice(0, -1));
        }
    }

    const {
        isApplyingText,
        setTextPositionListener,
        setIsApplyingText,
        textPositionListener,
        textColor,
        borderColor
    } = useTransformationsDataStore();

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

    const [isTextDialogOpen, setIsTextDialogOpen] = useState<boolean>(false);
    const [isBorderDialogOpen, setIsBorderDialogOpen] = useState<boolean>(false);

    const handleTextApplyClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setIsTextDialogOpen(false);
        setIsApplyingText(true);

        const textPositionListener = (e: MouseEvent) => {
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

    const cleanUpWASMEnvironment = async () => {
        const data = await FFmpeg!.readFile(`output.${imageFormat}`);
        const imageURL = URL.createObjectURL(new Blob([data], {type: `image/${imageFormat}`}));
        addURLToPrevList(imageURL);
        await FFmpeg!.deleteFile(`input.${imageFormat}`);
        await FFmpeg!.rename(`output.${imageFormat}`, `input.${imageFormat}`);
    }

    const applyTextToImage = async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        if (isApplyingText) {
            const rect = imageRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let wRatio = imageDimensions.x === 0 ? 1 : rect.width / imageDimensions.x;
            let hRatio = imageDimensions.y === 0 ? 1 : rect.height / imageDimensions.y;

            await FFmpeg!.exec(["-i", `input.${imageFormat}`, "-vf", `drawtext=fontfile=${watch("fontFile")}:text=${watch("text") ?? "Sample Text"}:x=${x / wRatio}:y=${y / hRatio}:fontsize=${watch("fontSize")}:fontcolor=${textColor ?? "#00ff00"}`, `output.${imageFormat}`, "-loglevel", "debug"])

            window.removeEventListener("mousemove", textPositionListener!, false);
            setTextPositionListener(null);
            setIsApplyingText(false);

            await cleanUpWASMEnvironment();
        }
    }

    const addBorderToImage = async () => {
        setIsBorderDialogOpen(false);

        await FFmpeg!.exec(["-i", `input.${imageFormat}`, "-vf", `pad=${borderWatch("borderSize") * 2}+iw:${borderWatch("borderSize") * 2}+ih:${borderWatch("borderSize")}:${borderWatch("borderSize")}:${borderColor}`, `output.${imageFormat}`]);
        await cleanUpWASMEnvironment();
    }

    const greyScale = async () => {
        await FFmpeg!.exec(`-i input.${imageFormat} -vf hue=s=0 output.${imageFormat}`.split(" "));
        await cleanUpWASMEnvironment();
    }

    return (
        <div className={"flex flex-col w-full h-full justify-center items-center"}>
            <Card className={"p-0"}>
                <CardHeader className={"p-0"}>
                    <CardTitle className={"flex mb-4 border-b lg:hidden"}>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button
                                    className={"min-w-20 rounded-none rounded-tl-lg border-y-0 border-l-0 border-r lg:hidden"}
                                    variant={"outline"}
                                >
                                    Edit Image
                                    <Pencil2Icon className={"ml-2"}/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Select an edit to make</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem className={"p-0"}>
                                    <Button
                                        className={"border-none w-full flex justify-between"}
                                        variant={"outline"} onClick={greyScale}
                                    >
                                        Greyscale Image
                                        <TransparencyGridIcon/>
                                    </Button>
                                </DropdownMenuItem>
                                <DropdownMenuItem className={"p-0"}>
                                    <BorderDialog
                                        isBorderDialogOpen={isBorderDialogOpen}
                                        setIsBorderDialogOpen={setIsBorderDialogOpen}
                                        borderControl={borderControl}
                                        addBorderToImage={addBorderToImage}
                                        isInsideDropdownMenu={true}
                                    />
                                </DropdownMenuItem>
                                <DropdownMenuItem className={"p-0"}>
                                    <TextDialog
                                        isTextDialogOpen={isTextDialogOpen}
                                        setIsTextDialogOpen={setIsTextDialogOpen}
                                        control={control}
                                        text={watch("text")}
                                        fontSize={watch("fontSize")}
                                        handleTextApplyClick={handleTextApplyClick}
                                        isInsideDropdownMenu={true}
                                    />
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem className={"p-0"}>
                                    <UndoEditCTA
                                        removeURLFromPrevList={removeURLFromPrevList}
                                        isInsideDropdownMenu={true}
                                    />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            className={"ml-auto rounded-none rounded-tr-lg border-y-0 border-r-0 border-l"}
                            onClick={() => downloadItem(`output.${imageFormat}`, sourceImageURL!)}
                            variant={"outline"}
                        >
                            Download Image
                            <DownloadIcon className={"ml-2"}/>
                        </Button>
                    </CardTitle>

                    <CardTitle
                        style={{marginTop: "0px", marginBottom: "16px"}} // className styles weren't working, FIXME!
                        className={"hidden border-b lg:flex"}
                    >
                        <Button
                            className={"rounded-none rounded-tl-lg border-none"}
                            variant={"outline"} onClick={greyScale}
                        >
                            Greyscale Image
                            <TransparencyGridIcon className={"ml-2"}/>
                        </Button>
                        <BorderDialog
                            isBorderDialogOpen={isBorderDialogOpen}
                            setIsBorderDialogOpen={setIsBorderDialogOpen}
                            borderControl={borderControl}
                            addBorderToImage={addBorderToImage}
                        />
                        <TextDialog
                            isTextDialogOpen={isTextDialogOpen}
                            setIsTextDialogOpen={setIsTextDialogOpen}
                            control={control}
                            text={watch("text")}
                            fontSize={watch("fontSize")}
                            handleTextApplyClick={handleTextApplyClick}
                        />
                        <UndoEditCTA removeURLFromPrevList={removeURLFromPrevList} />
                        <Button
                            className={"ml-auto rounded-none rounded-tr-lg border-y-0 border-r-0 border-l"}
                            onClick={() => downloadItem(`output.${imageFormat}`, sourceImageURL!)}
                            variant={"outline"}
                        >
                            Download Image
                            <DownloadIcon className={"ml-2"}/>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <img
                        className={"max-w-[80vw] max-h-[80vh] lg:max-w-[70vw] lg:max-h-[70vh]"}
                        ref={imageRef}
                        src={sourceImageURL!}
                        alt={"Image to Edit"}
                        onMouseDown={async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
                            await applyTextToImage(e);
                        }}
                    />
                </CardContent>
            </Card>

            <FloatingText
                followDivRef={followDivRef}
                fontSize={watch("fontSize")}
                textColor={textColor}
                imageRef={imageRef}
                text={watch("text")}
                imageDimensions={imageDimensions}
            />
        </div>
    )
}