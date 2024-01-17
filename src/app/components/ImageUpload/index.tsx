"use client";
import React, {ChangeEvent, RefObject} from "react";
import {UploadIcon} from "@radix-ui/react-icons";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import Image from "next/image";
import starry from "../../../../public/images/Starry.png";
import iimPhoto from "../../../../public/images/iimPhoto.png";
import fttwte from "../../../../public/images/forthosethatwishtoexist.png";

interface ImageUploadProps {
    fileInputRef: RefObject<HTMLInputElement>;
    sourceImageURL: string | null;
    initialize(e: ChangeEvent): Promise<void>;
    initializeWithPreloadedImage(fileUrl: string): Promise<void>;
}

// TODO: Display image with sourceImageURL
export default function ImageUpload({initialize, fileInputRef, sourceImageURL, initializeWithPreloadedImage}: ImageUploadProps) {
    const IMAGES = [
        {
            source: starry,
            alt: "Starry night"
        },
        {
            source: iimPhoto,
            alt: "A photo I took in IIM Ahmedabad"
        },
        {
            source: fttwte,
            alt: "Architects' FTTWE album cover"
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className=" mb-3">Add an image to edit</CardTitle>
            </CardHeader>

            <CardContent>
                <Label htmlFor="dropzone-file" className={"cursor-pointer"}>
                    <Card
                        className="flex p-4 items-center justify-center w-full brightness-[0.95] hover:brightness-[0.90] min-w-[300px] md:min-w-[600px] dark:brightness-125 dark:hover:brightness-150">
                        <div className="text-center w-full">
                            <div className="border p-2 rounded-md max-w-min mx-auto">
                                <UploadIcon/>
                            </div>

                            <p className="my-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click here to upload an image</span>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-400">
                                Formats supported: PNG, JPG, WebP
                            </p>
                        </div>
                    </Card>
                </Label>

                <Input
                    ref={fileInputRef}
                    id="dropzone-file"
                    accept="image/png, image/jpeg, image/webp"
                    type="file"
                    className="hidden"
                    onChange={initialize}
                />

                <div className="relative mt-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or pick one of these
                        </span>
                    </div>
                </div>

                <div className="flex gap-x-4 max-w-full px-2 pt-4">
                    {IMAGES.map(({source, alt}) => (
                        <Image
                            key={alt}
                            alt={alt}
                            src={source}
                            className={"max-w-[200px] rounded-lg cursor-pointer hover:brightness-[1.15]"}
                            onClick={async () => {
                                await initializeWithPreloadedImage(source.src);
                            }}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
