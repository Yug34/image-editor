"use client";

import React, {ChangeEvent, Dispatch, RefObject, SetStateAction} from "react";
import {UploadIcon} from "@radix-ui/react-icons";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface ImageUploadProps {
    fileInputRef: RefObject<HTMLInputElement>;
    sourceImageURL: string | null;
    handleChange(e: ChangeEvent): Promise<void>;
}

// TODO: Display image with sourceImageURL
export default function ImageUpload({handleChange, fileInputRef, sourceImageURL}: ImageUploadProps) {
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
                                Formats supported: .PNG, .JPG, .JPEG
                            </p>
                        </div>
                    </Card>
                </Label>

                <Input
                    ref={fileInputRef}
                    id="dropzone-file"
                    accept="image/png, image/jpeg"
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                />
            </CardContent>
        </Card>
    );
}
