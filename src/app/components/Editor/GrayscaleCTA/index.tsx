import {Button} from "@/components/ui/button";
import {TransparencyGridIcon} from "@radix-ui/react-icons";

interface GrayscaleCTAProps {
    greyScale(): void;
}

export const GrayscaleCTA = ({greyScale}: GrayscaleCTAProps) => {
    return (
        <Button
            className={"border-0 w-full flex justify-between lg:border-r lg:rounded-none lg:rounded-tl-md"}
            variant={"outline"} onClick={greyScale}
        >
            Greyscale Image
            <TransparencyGridIcon className={"ml-3"}/>
        </Button>
    )
}