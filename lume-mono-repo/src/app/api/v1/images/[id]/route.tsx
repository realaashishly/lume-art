import { NextRequest, NextResponse } from "next/server";
import GeneratedImage from "@/models/GeneratedImage";

// GET: Fetch a single image by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const image = await GeneratedImage.findById(params.id);
        if (!image) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: true, data: image },
            { status: 200 }
        );
    } catch (error) {
        console.error(`Error fetching image with ID ${params.id}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch image" },
            { status: 500 }
        );
    }
}

// DELETE: Delete an image by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const success = await GeneratedImage.findOneAndDelete({
            _id: params.id,
        });
        if (!success) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: true, data: { message: "Image deleted successfully" } },
            { status: 200 }
        );
    } catch (error) {
        console.error(`Error deleting image with ID ${params.id}:`, error);
        return NextResponse.json(
            { success: false, error: "Failed to delete image" },
            { status: 500 }
        );
    }
}
