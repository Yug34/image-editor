"use client";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import {Button} from "@/components/ui/button";

export default function Editor() {
    const imageRef = useRef<HTMLImageElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [sourceImageURL, setSourceImageURL] = useState<string | null>(null);
    const [imageFormat, setImageFormat] = useState<string | null>(null);

    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [image, setImage] = useState<Uint8Array | null>(null);
    const ffmpegRef = useRef(new FFmpeg());

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('log', ({message}) => {
            console.log(message);
        });

        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        });

        setIsLoaded(true);
    }


    const initialize = async (e: ChangeEvent) => {
        const file = (e.target as HTMLInputElement)!.files![0];

        const format = file.type.split("/")[1];
        setImageFormat(format);

        const fileData = await fetchFile(file);
        const ffmpeg = ffmpegRef.current;

        await ffmpeg.writeFile(`input.${format}`, fileData);

        await ffmpeg.writeFile("OpenSans-LightItalic.ttf", await fetchFile("http://localhost:3000/fonts/OpenSans-LightItalic.ttf"));

        await ffmpeg.exec([`-i`, `input.${format}`]);

        ffmpeg.readFile(`input.${format}`).then((imageData) => {
            const imageURL = URL.createObjectURL(new Blob([imageData], {type: `image/${format}`}));
            setSourceImageURL(imageURL);
        });

        console.log(await ffmpeg.listDir("/"));

        setImage(fileData);
    }

    const cleanUp = async () => {
        const ffmpeg = ffmpegRef.current;
        const data = await ffmpeg.readFile(`output.${imageFormat}`);
        const imageURL = URL.createObjectURL(new Blob([data], { type: `image/${imageFormat}` }));
        await ffmpeg.listDir("/");
        await ffmpeg.deleteFile(`input.${imageFormat}`);
        await ffmpeg.rename(`output.${imageFormat}`, `input.${imageFormat}`);
        setSourceImageURL(imageURL);
    }

    const greyScale = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(`-i input.${imageFormat} -vf hue=s=0 output.${imageFormat}`.split(" "));
        await cleanUp();
    }

    const addText = async () => {
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.exec(["-i", `input.${imageFormat}`, "-vf", `drawtext=fontfile=./OpenSans-LightItalic.ttf:text=SampleText:x=10:y=10:fontsize=40`, `output.${imageFormat}`, "-loglevel", "debug"])
        await cleanUp();
    }

    const ImageDisplay = () => {
        return (
            <img ref={imageRef} src={sourceImageURL!} alt={"Image to Edit"} />
        );
    };

    return (isLoaded && image) ? (
        <div>
            <p ref={messageRef}></p>
            <ImageDisplay/>
            <Button onClick={() => {greyScale();}}>Grayscale</Button>
            <Button onClick={() => {addText();}}>Add text</Button>
        </div>
        ) : (
        <div>
            <label htmlFor="file-upload" className="custom-file-upload">{image ? "Loading ffmpeg" : "Add an image to start"}</label>
            <input
                style={{display: "none"}} id="file-upload" type="file" ref={fileInputRef}
                onChange={initialize}
            />
        </div>
    )
}
