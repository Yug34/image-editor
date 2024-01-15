"use client";

import React, {ChangeEvent, Dispatch, RefObject, SetStateAction} from "react";
import {UploadIcon} from "@radix-ui/react-icons";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface ImageUploadProps {
    prevSourceImageURLs: string[];
    setPrevSourceImageURLs: Dispatch<SetStateAction<string[]>>;
    handleChange(e: ChangeEvent): Promise<void>;
    fileInputRef: RefObject<HTMLInputElement>;
    sourceImageURL: string | null;
    loaded: boolean;
    setLoaded: Dispatch<SetStateAction<boolean>>;
}

export default function ImageUpload({handleChange, fileInputRef}: ImageUploadProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className=" mb-3">Add an image to edit</CardTitle>
            </CardHeader>

            <CardContent>
                <Card
                      className="flex p-4 items-center justify-center w-full brightness-125 hover:brightness-150 cursor-pointer min-w-[300px] md:min-w-[600px]">
                    <Label htmlFor="dropzone-file">
                        <div className="text-center w-full cursor-pointer">
                            <div className="border p-2 rounded-md max-w-min mx-auto">
                                <UploadIcon />
                            </div>

                            <p className="my-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click here to upload an image</span>
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-400">
                                Formats supported: .PNG, .JPG, .JPEG
                            </p>
                        </div>
                    </Label>

                    <Input
                        ref={fileInputRef}
                        id="dropzone-file"
                        accept="image/png, image/jpeg"
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                    />
                </Card>
            </CardContent>
        </Card>
    );
}
