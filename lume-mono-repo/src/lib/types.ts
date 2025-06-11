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
    batchId: string;
    prompt: string;
    aspectRatio: AspectRatio;
    enhance: boolean;
    style?: string;
    imageUrl: string;
    likes: string[];
    createdAt: string;
    updatedAt: string;
};

// Define form schema with Zod
export const formSchema = z.object({
    prompt: z.string().min(2, {
        message: "The provided prompt is empty or invalid.",
    }),
    variations: z.enum(["1", "2", "4"]),
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
        .enum([
            "default",
            "realistic",
            "cartoon",
            "abstract",
            "painting",
            "sketch",
        ])
        .optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export type GeneratedImageProps = {
    batchId: string;
    prompt: string;
    imageUrl: string;
    style?: string;
    aspect: AspectRatio;
    variations: string;
    enhance: boolean;
};