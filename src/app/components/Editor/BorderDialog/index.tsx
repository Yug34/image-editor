import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Control, Controller} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {HexColorPicker} from "react-colorful";
import {Dispatch, SetStateAction} from "react";
import { BorderAllIcon } from "@radix-ui/react-icons";
import {useTransformationsDataStore} from "@/store/transformationsDataStore";

interface BorderDialogProps {
    isBorderDialogOpen: boolean;
    setIsBorderDialogOpen: Dispatch<SetStateAction<boolean>>;
    borderControl: Control<{borderSize: number}>;
    addBorderToImage: () => void;
}

export const BorderDialog = ({
    isBorderDialogOpen,
    setIsBorderDialogOpen,
    borderControl,
    addBorderToImage
}: BorderDialogProps) => {
    const {borderColor, setBorderColor} = useTransformationsDataStore();

    return (
        <Dialog
            open={isBorderDialogOpen}
            onOpenChange={setIsBorderDialogOpen}
        >
            <DialogTrigger asChild>
                <Button className={"w-full border-0 rounded-md flex justify-between lg:rounded-none lg:border-y-0 lg:border-l-0 lg:border-r"} variant={"outline"}>
                    Add border
                    <BorderAllIcon className={"ml-2"}/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add border to image</DialogTitle>
                    <DialogDescription>
                        Select border color and width.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                        }}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <DialogDescription>Border size</DialogDescription>
                                    <Controller
                                        control={borderControl}
                                        name="borderSize"
                                        render={({field}) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    placeholder={"Border size in px"}
                                                    required
                                                    min={1}
                                                    type={"number"}
                                                />
                                            );
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-4 colorPickerParent">
                                    <HexColorPicker color={borderColor} onChange={setBorderColor}/>
                                </div>
                                <Button className="w-full" onClick={() => {
                                    addBorderToImage();
                                }}>
                                    Add Border to image
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}