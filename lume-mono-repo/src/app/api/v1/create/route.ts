import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt, width, height, enhance, style } = await req.json();

        if (!prompt || !width || !height) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const API_Token = process.env.TOKEN_API_KEY;

        if (!API_Token)
            return NextResponse.json(
                { success: false, message: "API token not available!" },
                { status: 400 }
            );

        // 2. Generate random seed
        const seed = Math.floor(Math.random() * 1000000);

        // 3. Build the request
        const url = `${process.env.BASE_URL}/prompt/${encodeURIComponent(
            prompt
        )}`;


        const response = await axios.get(url, {
            params: {
                seed,
                width,
                height,
                nologo: "true",
                enhance,
            },
            headers: {
                Authorization: `Bearer ${API_Token}`,
            },
            responseType: "arraybuffer", // ensures binary image buffer
        });

        // 4. Convert binary response to base64
        const contentType =
            (await response.headers["content-type"]) || "image/jpeg";
        const base64Image = Buffer.from(response.data, "binary").toString(
            "base64"
        );

        const generatedImageUrl = `data:${contentType};base64,${base64Image}`;

        return NextResponse.json({ image: generatedImageUrl }, { status: 200 });
    } catch (error) {
        console.log("Error in image generation:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
