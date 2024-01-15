import {Button} from "@/components/ui/button";
import {ResetIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils";

interface UndoEditCTAProps {
    removeURLFromPrevList: () => Promise<void>;
    prevSourceImageURLs: string[];
    isInsideDropdownMenu?: boolean;
}

export const UndoEditCTA = ({removeURLFromPrevList, isInsideDropdownMenu, prevSourceImageURLs}: UndoEditCTAProps) => {
    return (
        <Button
            className={cn(
                isInsideDropdownMenu ? "border-none w-full flex justify-between" : "rounded-none border-y-0",
                prevSourceImageURLs ? "cursor-not-allowed" : "cursor-pointer"
                )}
            onClick={removeURLFromPrevList}
            variant={"outline"}
        >
            Undo
            <ResetIcon className={"ml-2"}/>
        </Button>
    )
};