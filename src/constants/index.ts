import starry from "../../public/images/Starry.png";
import iimPhoto from "../../public/images/iimPhoto.png";
import fttwte from "../../public/images/forthosethatwishtoexist.png";

export type FontFace = {
    display: string;
    file: string;
}
export const FONTFACES: FontFace[] = [
    {
        display: "OpenSans Bold",
        file: "OpenSans-Bold.ttf"
    },
    {
        display: "OpenSans Bold Italic",
        file: "OpenSans-BoldItalic.ttf"
    },
    {
        display: "OpenSans Extra Bold",
        file: "OpenSans-ExtraBold.ttf"
    },
    {
        display: "OpenSans Extra Bold Italic",
        file: "OpenSans-ExtraBoldItalic.ttf"
    },
    {
        display: "OpenSans Italic",
        file: "OpenSans-Italic.ttf"
    },
    {
        display: "OpenSans Light",
        file: "OpenSans-Light.ttf"
    },
    {
        display: "OpenSans LightItalic",
        file: "OpenSans-LightItalic.ttf"
    },
    {
        display: "OpenSans Regular",
        file: "OpenSans-Regular.ttf"
    },
    {
        display: "OpenSans Semibold",
        file: "OpenSans-Semibold.ttf"
    },
    {
        display: "OpenSans SemiboldItalic",
        file: "OpenSans-SemiboldItalic.ttf"
    },
]

export const IMAGES = [
    {
        source: starry,
        alt: "Starry night"
    },
    {
        source: iimPhoto,
        alt: "A photo I took in IIM Ahmedabad"
    },
    {
        source: fttwte,
        alt: "Architects' FTTWE album cover"
    },
]