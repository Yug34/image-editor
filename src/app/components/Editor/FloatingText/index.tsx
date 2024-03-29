import {RefObject} from "react";
import {useTransformationsDataStore} from "@/store/transformationsDataStore";

interface FloatingTextProps {
    followDivRef: RefObject<HTMLDivElement>;
    fontSize: number;
    textColor: string;
    imageRef: RefObject<HTMLImageElement>;
    text: string;
    imageDimensions: {
        x: number;
        y: number;
    }
}

export const FloatingText = ({followDivRef, fontSize, textColor, imageRef, text, imageDimensions}: FloatingTextProps) => {
    const { isApplyingText} = useTransformationsDataStore();

    return isApplyingText ? (
        <div
            ref={followDivRef}
            style={{
                fontSize: `${fontSize}px`,
                color: textColor,
                transform: `scale(${
                    imageRef.current!.getBoundingClientRect().width / imageDimensions.x
                }, ${
                    imageRef.current!.getBoundingClientRect().height / imageDimensions.y
                })`
            }}
            className={`absolute top-0 left-0 pointer-events-none`}
        >
            {text}
        </div>
    ) : null;
}