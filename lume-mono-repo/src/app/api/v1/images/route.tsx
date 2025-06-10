import { auth } from "@/app/(auth)/auth";
import { connectToDatabase } from "@/lib/mongoose";
import GeneratedImage from "@/models/GeneratedImage";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get session inside the function
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        const userId = session?.user?.id || session?.session?.userId;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const requestBody = await req.json();
        const imageData = requestBody.imageData || requestBody;

        const { prompt, title, imageUrls, variations, aspect, enhance, style } =
            imageData;

        if (
            !prompt ||
            !imageUrls ||
            !Array.isArray(imageUrls) ||
            imageUrls.length === 0
        ) {
            return NextResponse.json(
                { error: "Missing required fields: prompt and imageUrls" },
                { status: 400 }
            );
        }

        // Create new image document
        const newImage = new GeneratedImage({
            userId: userId,
            prompt: prompt.trim(),
            title: title?.content?.trim() || prompt.slice(0, 10),
            aspectRatio: aspect || "2:3",
            enhance: Boolean(enhance),
            style: style || "realistic",
            imageUrls: imageUrls.filter(
                (url) => url && typeof url === "string"
            ),
            likes: [],
        });

        const savedImage = await newImage.save();

        return NextResponse.json(
            {
                success: true,
                message: "Images stored successfully",
                data: savedImage,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Store image API error:", error);
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

// export async function GET() {
//     try {
//         await connectToDatabase();

        
        

//         // Get session for GET request as well
//         const session = await auth.api.getSession({
//             headers: await headers(),
//         });

//         const userId = session?.user?.id || session?.session?.userId;

//         if (!userId) {
//             return NextResponse.json(
//                 { error: "Unauthorized" },
//                 { status: 401 }
//             );
//         }


//         const images = await GeneratedImage.find({ userId: userId }).sort({
//             createdAt: -1,
//         });

        

//         // You can add logic here to retrieve images for the user
//         // For now, just returning success message
//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Retrieve Image Successfully",
//                 data: images,
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error("Get images API error:", error);
//         return NextResponse.json(
//             {
//                 error: "Internal server error",
//                 details:
//                     error instanceof Error ? error.message : "Unknown error",
//             },
//             { status: 500 }
//         );
//     }
// }

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        const userId = session?.user?.id || session?.session?.userId;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Otherwise, get all images for this user
        const images = await GeneratedImage.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                message: "Retrieve Images Successfully",
                data: images,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get images API error:", error);
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

