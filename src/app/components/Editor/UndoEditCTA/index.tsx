import {Button} from "@/components/ui/button";
import {ResetIcon} from "@radix-ui/react-icons";
import {cn} from "@/lib/utils";
import {useImageDataStore} from "@/store/imageDataStore";

interface UndoEditCTAProps {
    removeURLFromPrevList: () => Promise<void>;
}

export const UndoEditCTA = ({removeURLFromPrevList}: UndoEditCTAProps) => {
    const {prevSourceImageURLs} = useImageDataStore();

    return (
        <Button
            className={cn("border-0 w-full flex justify-between lg:rounded-none lg:border-y-0 lg:border-r",
                prevSourceImageURLs.length <= 1 ? "cursor-not-allowed" : "cursor-pointer"
            )}
            onClick={removeURLFromPrevList}
            variant={"outline"}
            disabled={prevSourceImageURLs.length <= 1}
        >
            Undo
            <ResetIcon className={"ml-2"}/>
        </Button>
    )
};