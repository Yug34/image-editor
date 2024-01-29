import {Button} from "@/components/ui/button";
import {ResetIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils";
import {useImageDataStore} from "@/store/imageDataStore";

interface UndoEditCTAProps {
    removeURLFromPrevList: () => Promise<void>;
    isInsideDropdownMenu?: boolean;
}

export const UndoEditCTA = ({removeURLFromPrevList, isInsideDropdownMenu}: UndoEditCTAProps) => {
    const {prevSourceImageURLs} = useImageDataStore();

    return (
        <Button
            className={cn(
                isInsideDropdownMenu ? "border-none w-full flex justify-between" : "rounded-none border-y-0",
                prevSourceImageURLs.length <= 1 ? "cursor-not-allowed" : "cursor-pointer"
            )}
            onClick={removeURLFromPrevList}
            variant={"outline"}
        >
            Undo
            <ResetIcon className={"ml-2"}/>
        </Button>
    )
};