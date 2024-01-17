import {Ref} from "react";

interface FloatingTextProps {
    followDivRef: Ref<HTMLDivElement>;
    fontSize: number;
    textColor: string;
    imageRef: Ref<HTMLImageElement>;
    text: string;
    imageDimensions: {
        x: number;
        y: number;
    }
}

export const FloatingText = ({followDivRef, fontSize, textColor, imageRef, text, imageDimensions}: FloatingTextProps) => {
    return (
        <div
            ref={followDivRef}
            style={{
                fontSize: `${fontSize}px`,
                color: textColor,
                transform: `scale(${
                    imageRef!.current!.getBoundingClientRect().width / imageDimensions.x
                }, ${
                    imageRef!.current!.getBoundingClientRect().height / imageDimensions.y
                })`
            }}
            className={`absolute top-0 left-0 pointer-events-none`}
        >
            {text}
        </div>
    )
}