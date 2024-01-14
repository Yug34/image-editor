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
import {FONTFACES} from "@/constants";
import {HexColorPicker} from "react-colorful";
import {Dispatch, SetStateAction} from "react";

interface TextDialogProps {
    isTextDialogOpen: boolean;
    setIsTextDialogOpen: Dispatch<SetStateAction<boolean>>;
    control: Control<{text: string, fontSize: number, fontFile: string}>;
    textColor: string;
    setTextColor: Dispatch<SetStateAction<string>>;
    text: string;
    fontSize: number;
    handleTextApplyClick: (e: MouseEvent) => void;
}

export const TextDialog = ({isTextDialogOpen, setIsTextDialogOpen, control, textColor, setTextColor, text, fontSize, handleTextApplyClick}: TextDialogProps) => {
    return (
        <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
            <DialogTrigger asChild>
                <Button className={"rounded-none border-y-0"} variant={"outline"}>Add text</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add text to image</DialogTitle>
                    <DialogDescription>
                        Select text color, change text, select fonts.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                        }}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <DialogDescription>Text to Add</DialogDescription>
                                    <Controller
                                        control={control}
                                        name="text"
                                        render={({field}) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    placeholder={"Sample Text"}
                                                    required
                                                    type={"text"}
                                                />
                                            );
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <DialogDescription>Font Size</DialogDescription>
                                    <Controller
                                        control={control}
                                        name="fontSize"
                                        render={({field}) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    required
                                                    placeholder={"Font size in px"}
                                                    min={10}
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
                                        render={({field}) => {
                                            return (
                                                <select {...field}>
                                                    {FONTFACES.map((fontFace) => (
                                                        <option key={fontFace.display}
                                                                value={fontFace.file}>{fontFace.display}</option>
                                                    ))}
                                                </select>
                                            );
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-4 colorPickerParent">
                                    <div className={"flex flex-col gap-y-2"}>
                                        <DialogDescription>Text Preview</DialogDescription>
                                        <div
                                            className="rounded-md px-2 w-full h-full border bg-card text-card-foreground shadow-sm mb-4"
                                            style={{color: textColor, fontSize: fontSize}}
                                        >
                                            {text}
                                        </div>
                                    </div>
                                    <HexColorPicker color={textColor} onChange={setTextColor}/>
                                </div>
                                <Button className="w-full" onClick={(e) => {
                                    //@ts-ignore
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
    )
}