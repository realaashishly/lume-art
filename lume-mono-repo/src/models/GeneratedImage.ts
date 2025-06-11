import mongoose, { Schema, Document } from "mongoose";

export interface IGeneratedImage extends Document {
    userId: mongoose.Types.ObjectId;
    batchId: string;
    prompt: string;
    aspectRatio: string;
    enhance: boolean;
    style?: string;
    imageUrl: string;
    likes: string[];
    createdAt: Date;
    updatedAt: Date;
}

const GeneratedImageSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        batchId: {
            type: String,
            required: true
        },
        prompt: {
            type: String,
            required: true,
            trim: true,
        },
        aspectRatio: {
            type: String,
            required: true,
            enum: [
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
            ],
        },
        enhance: {
            type: Boolean,
            default: false,
        },
        style: {
            type: String,
            enum: [
                "default",
                "realistic",
                "cartoon",
                "abstract",
                "painting",
                "sketch",
            ],
            default: "default",
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            },
        ],
    },
    {
        timestamps: true,
        collection: "generatedImages",
    }
);

export default mongoose.models.GeneratedImage ||
  mongoose.model<IGeneratedImage>("GeneratedImage", GeneratedImageSchema);