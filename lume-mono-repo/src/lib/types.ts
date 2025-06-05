import { z } from "zod";

export type AspectRatio =
    | "1:1"
    | "3:2"
    | "2:3"
    | "4:3"
    | "3:4"
    | "16:9"
    | "9:16"
    | "21:9"
    | "9:21"
    | "5:4"
    | "4:5"
    | "7:5"
    | "5:7"
    | "2:1"
    | "1:2";

// Updated to match the database schema
export type GeneratedImage = {
    _id: string;
    userId: string;
    title: string;
    prompt: string;
    aspectRatio: AspectRatio; // Changed from 'aspect' to match schema
    enhance: boolean;
    style?: string;
    imageUrls: string[]; // Changed to array to match schema
    likes: string[];
    createdAt: string;
    updatedAt: string;
    // Backward compatibility - some components might still use these
    imageUrl?: string; // For backward compatibility
    aspect?: AspectRatio; // For backward compatibility
    variations?: string; // For backward compatibility
};

// Define form schema with Zod
export const formSchema = z.object({
    prompt: z.string().min(2, {
        message: "Prompt must be at least 2 characters.",
    }),
    variations: z.enum(["1", "2", "4", "8"]),
    aspect: z.enum([
        "1:1",
        "3:2",
        "2:3",
        "4:3",
        "3:4",
        "16:9",
        "9:16",
        "21:9",
        "9:21",
        "5:4",
        "4:5",
        "7:5",
        "5:7",
        "2:1",
        "1:2",
    ]),
    style: z
        .enum(["realistic", "cartoon", "abstract", "painting", "sketch"])
        .optional(),
});

export type FormValues = z.infer<typeof formSchema>;