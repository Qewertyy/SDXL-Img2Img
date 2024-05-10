import axios, { AxiosError, AxiosResponse } from "axios";
import * as FormData from "form-data";
import * as fs from "fs"

type file = {
    ext: string;
    mime: string
};

const baseURL = "https://turbo.art";
const apiURL = "https://gongy--stable-diffusion-xl-turbo-model-inference.modal.run/";

function guessMimeType(file: Buffer) {
    const signature = file.toString("hex", 0, 4);
    let fileType: file;
    if (signature === "89504e47") {
        fileType = {
            ext: "png",
            mime: "image/png",
        };
    } else if (signature === "ffd8ffe0" || signature === "ffd8ffe1") {
        fileType = {
            ext: "jpg",
            mime: "image/jpeg",
        };
    } else {
        return "Invalid file type";
    };
    return fileType;
};

async function generateImage(prompt: string, image: Buffer) {
    const fileType: file | string = guessMimeType(image);
    if (typeof fileType === "string") {
        throw new Error(fileType);
    };
    const headers = {
        Origin: baseURL,
        Referer: baseURL + '/',
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    };
    const formdata = new FormData();
    formdata.append("prompt", prompt);
    formdata.append("image", image, { filename: 'image' + fileType.ext, contentType: fileType.mime });
    formdata.append("num_iterations", 2);
    const response: AxiosResponse | AxiosError = await axios.post(
        apiURL,
        formdata,
        {
            headers: formdata.getHeaders(headers),
            responseType: 'arraybuffer'
        }
    ).catch((err) => err);
    if (response instanceof AxiosError) {
        console.log(response.response?.status, response.response?.data);
        return "an error occured while generating the image."
    };
    await fs.writeFile(`./public/generatedImage_${Date.now()}.jpg`, response.data, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('image generated successfully.');
        };
    });
};

generateImage("make it a G-wagon", fs.readFileSync("./public/jeep.png"))
