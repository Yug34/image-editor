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
import {TextIcon} from "@radix-ui/react-icons";
import {useTransformationsDataStore} from "@/store/transformationsDataStore";

interface TextDialogProps {
    isTextDialogOpen: boolean;
    setIsTextDialogOpen: Dispatch<SetStateAction<boolean>>;
    control: Control<{text: string, fontSize: number, fontFile: string}>;
    text: string;
    fontSize: number;
    handleTextApplyClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    isInsideDropdownMenu?: boolean;
}

export const TextDialog = ({isTextDialogOpen, setIsTextDialogOpen, control, text, fontSize, handleTextApplyClick, isInsideDropdownMenu}: TextDialogProps) => {
    const {setTextColor, textColor} = useTransformationsDataStore();

    return (
        <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
            <DialogTrigger asChild>
                <Button className={`${isInsideDropdownMenu ? "w-full border-none flex justify-between" : "rounded-none border-y-0"}`} variant={"outline"}>
                    Add text
                    <TextIcon className={"ml-2"}/>
                </Button>
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
                                    <DialogDescription>Font face</DialogDescription>
                                    <Controller
                                        control={control}
                                        name="fontFile"
                                        render={({field}) => {
                                            return (
                                                <select
                                                    {...field}
                                                    className={"h-10 w-full rounded-md border border-input bg-background p-2 text-sm ring-offset-background outline-none"}
                                                >
                                                    {FONTFACES.map((fontFace) => (
                                                        <option
                                                            className={"bg-background text-sm ring-offset-background border-none"}
                                                            key={fontFace.display}
                                                            value={fontFace.file}
                                                        >
                                                            {fontFace.display}
                                                        </option>
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