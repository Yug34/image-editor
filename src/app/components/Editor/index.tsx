"use client";
import { useEffect, useRef, useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Pencil2Icon } from "@radix-ui/react-icons";
import React from "react";

import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextDialog } from "@/app/components/Editor/TextDialog";
import { BorderDialog } from "@/app/components/Editor/BorderDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UndoEditCTA } from "@/app/components/Editor/UndoEditCTA";
import { downloadItem } from "@/lib/utils";
import { FloatingText } from "@/app/components/Editor/FloatingText";
import { useImageDataStore } from "@/store/imageDataStore";
import { useTransformationsDataStore } from "@/store/transformationsDataStore";
import { useFfmpegDataStore } from "@/store/ffmpegDataStore";
import { GrayscaleCTA } from "@/app/components/Editor/GrayscaleCTA";

export default function Editor() {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const {
    sourceImageURL,
    setSourceImageURL,
    prevSourceImageURLs,
    setPrevSourceImageURLs,
    imageFormat,
    imageDimensions,
    addURLToPrevList,
  } = useImageDataStore();

  const followDivRef = useRef<HTMLDivElement | null>(null);
  const { FFmpeg } = useFfmpegDataStore();

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
      await FFmpeg!.writeFile(
        `input.${imageFormat}`,
        await fetchFile(prevSourceImageURLs[prevSourceImageURLs.length - 2])
      );

      setPrevSourceImageURLs(prevSourceImageURLs.slice(0, -1));
    }
  };

  const {
    isApplyingText,
    setTextPositionListener,
    setIsApplyingText,
    textPositionListener,
    textColor,
    borderColor,
  } = useTransformationsDataStore();

  const { control, watch } = useForm({
    mode: "onChange",
    defaultValues: {
      text: "Sample Text",
      fontSize: 24,
      fontFile: "OpenSans-Regular.ttf",
    },
  });

  const { control: borderControl, watch: borderWatch } = useForm({
    mode: "onChange",
    defaultValues: {
      borderSize: 20,
    },
  });

  const [isTextDialogOpen, setIsTextDialogOpen] = useState<boolean>(false);
  const [isBorderDialogOpen, setIsBorderDialogOpen] = useState<boolean>(false);

  const handleTextApplyClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setIsTextDialogOpen(false);
    setIsApplyingText(true);

    const textPositionListener = (e: MouseEvent) => {
      const x = e ? e.clientX : event.clientX;
      const y = e ? e.clientY : event.clientY;

      if (followDivRef.current) {
        followDivRef.current.style.top = `${y - 8}px`;
        followDivRef.current.style.left = `${x}px`;
      }
    };

    window.addEventListener("mousemove", textPositionListener, false);
    setTextPositionListener(textPositionListener);
  };

  const cleanUpWASMEnvironment = async () => {
    const data = await FFmpeg!.readFile(`output.${imageFormat}`);
    const imageURL = URL.createObjectURL(
      new Blob([data], { type: `image/${imageFormat}` })
    );
    addURLToPrevList(imageURL);
    await FFmpeg!.deleteFile(`input.${imageFormat}`);
    await FFmpeg!.rename(`output.${imageFormat}`, `input.${imageFormat}`);
  };

  const applyTextToImage = async (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    if (isApplyingText) {
      const rect = imageRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let wRatio = imageDimensions.x === 0 ? 1 : rect.width / imageDimensions.x;
      let hRatio =
        imageDimensions.y === 0 ? 1 : rect.height / imageDimensions.y;

      await FFmpeg!.exec([
        "-i",
        `input.${imageFormat}`,
        "-vf",
        `drawtext=fontfile=${watch("fontFile")}:text=${
          watch("text") ?? "Sample Text"
        }:x=${x / wRatio}:y=${y / hRatio}:fontsize=${watch(
          "fontSize"
        )}:fontcolor=${textColor ?? "#00ff00"}`,
        `output.${imageFormat}`,
        "-loglevel",
        "debug",
      ]);

      window.removeEventListener("mousemove", textPositionListener!, false);
      setTextPositionListener(null);
      setIsApplyingText(false);

      await cleanUpWASMEnvironment();
    }
  };

  const addBorderToImage = async () => {
    setIsBorderDialogOpen(false);

    await FFmpeg!.exec([
      "-i",
      `input.${imageFormat}`,
      "-vf",
      `pad=${borderWatch("borderSize") * 2}+iw:${
        borderWatch("borderSize") * 2
      }+ih:${borderWatch("borderSize")}:${borderWatch(
        "borderSize"
      )}:${borderColor}`,
      `output.${imageFormat}`,
    ]);
    await cleanUpWASMEnvironment();
  };

  const greyScale = async () => {
    await FFmpeg!.exec(
      `-i input.${imageFormat} -vf hue=s=0 output.${imageFormat}`.split(" ")
    );
    await cleanUpWASMEnvironment();
  };

  const TransformationCTAs: { type: string; el: React.ReactNode }[] = [
    {
      type: "Grayscale",
      el: <GrayscaleCTA greyScale={greyScale} />,
    },
    {
      type: "Border",
      el: (
        <BorderDialog
          isBorderDialogOpen={isBorderDialogOpen}
          setIsBorderDialogOpen={setIsBorderDialogOpen}
          borderControl={borderControl}
          addBorderToImage={addBorderToImage}
        />
      ),
    },
    {
      type: "Text",
      el: (
        <TextDialog
          isTextDialogOpen={isTextDialogOpen}
          setIsTextDialogOpen={setIsTextDialogOpen}
          control={control}
          text={watch("text")}
          fontSize={watch("fontSize")}
          handleTextApplyClick={handleTextApplyClick}
        />
      ),
    },
    {
      type: "Undo",
      el: <UndoEditCTA removeURLFromPrevList={removeURLFromPrevList} />,
    },
  ];

  return (
    <div
      className={
        "mt-12 flex flex-col w-full h-full justify-center items-center"
      }
    >
      <Card className={"p-0"}>
        <CardHeader className={"p-0"}>
          <CardTitle className={"flex mb-4 border-b lg:hidden"}>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  className={
                    "min-w-20 rounded-none rounded-tl-lg border-y-0 border-l-0 border-r lg:hidden"
                  }
                  variant={"outline"}
                >
                  Edit Image
                  <Pencil2Icon className={"ml-2"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select an edit to make</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TransformationCTAs.map(({ type, el }) => (
                  <DropdownMenuItem className={"p-0"} key={type}>
                    {el}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardTitle>

          <CardTitle
            style={{ marginTop: "0px", marginBottom: "16px" }} // className styles weren't working, FIXME!
            className={"hidden border-b lg:flex"}
          >
            {TransformationCTAs.map(({ type, el }) => (
              <React.Fragment key={type}>{el}</React.Fragment>
            ))}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <img
            className={"max-w-[70vw] max-h-[70vh]"}
            ref={imageRef}
            src={sourceImageURL!}
            alt={"Image to Edit"}
            onMouseDown={async (
              e: React.MouseEvent<HTMLImageElement, MouseEvent>
            ) => {
              await applyTextToImage(e);
            }}
          />
        </CardContent>
        <CardFooter className="p-0">
          <Button
            className={
              "w-full rounded-none rounded-b-lg border-x-0 border-b-0 border-t"
            }
            onClick={() =>
              downloadItem(`output.${imageFormat}`, sourceImageURL!)
            }
            variant={"outline"}
          >
            Download Edited Image
            <DownloadIcon className={"ml-2"} />
          </Button>
        </CardFooter>
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
  );
}
