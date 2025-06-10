"use client";
import Header from "@/components/Header";
import LayoutWrapper from "@/components/LayoutWrapper";
import ImagePromptInput from "@/components/PromptInput";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/lib/types";
import { fetchImageById } from "@/utils/fetchImages";
import { useQuery } from "@tanstack/react-query";
import { Edit, Heart, MessageCircle, RefreshCw, Video } from "lucide-react";
import { useState } from "react";


interface ImageData {
    _id: string;
    imageUrls: string[];
    createdAt: string;
    title?: string;
    prompt: string;
    likes?: number; // Add likes for the like button
    comments?: number; // Add comments for the comment/share button
}

export default function ImageDetailPage({ params }: { params: { id: string } }) {
    const [loading, setLoading] = useState<boolean>(false);
    const [skeletonRatio] = useState<AspectRatio>("3:4");

    // Fetch the specific image using React Query
    const {
        data: image,
        isLoading: isFetchingImage,
        error: fetchError,
    } = useQuery<ImageData>({
        queryKey: ["image", params.id],
        queryFn: async () => {
            const result = await fetchImageById(params.id);
            if (!result) throw new Error("Image not found");
            return { ...result, likes: 388, comments: 29 } as ImageData; // Mock likes and comments to match screenshot
        },
        retry: 2,
        staleTime: 1000 * 60 * 5,
    });

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        return date
            .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            })
            .replace(",", ""); // e.g., "Jun 4 8:36PM"
    };

    return (
        <LayoutWrapper>
            <Header />
            <div className="relative w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-4">
                {/* Loading Skeleton */}
                {isFetchingImage && (
                    <div className="flex justify-center">
                        <Skeleton
                            style={{
                                aspectRatio: skeletonRatio.replace(":", "/"),
                                width: "300px",
                            }}
                            className="bg-zinc-800 rounded-none p-2"
                        />
                    </div>
                )}

                {loading && (
                    <div className="mb-8 flex justify-center">
                        <div className="mb-4">
                            <h2 className="text-2xl font-semibold text-white border-b border-zinc-700 pb-2">
                                Generating...
                            </h2>
                        </div>
                        <Skeleton
                            style={{
                                aspectRatio: skeletonRatio.replace(":", "/"),
                                width: "300px",
                            }}
                            className="bg-zinc-800 rounded-none"
                        />
                    </div>
                )}

                {/* Display the Image */}
                {image && !isFetchingImage && !fetchError && (
                    <div className="flex flex-col items-center w-full max-w-md">
                        {/* Date Header */}
                        <div className="mb-1">
                            <h2 className="text-xs font-medium text-gray-500 uppercase">
                                {formatDateHeader(image.createdAt)}
                            </h2>
                        </div>

                        {/* Image and Details */}
                        <div className="text-center w-full">
                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-3">
                                {image.title}
                            </h3>

                            {/* Image */}
                            <div className="mb-4">
                                <img
                                    src={image.imageUrls[0]}
                                    alt={image.title}
                                    className="w-full max-w-[300px] mx-auto rounded-none"
                                    loading="lazy"
                                />
                            </div>

                            {/* Like and Comment Buttons */}
                            <div className="flex justify-end items-center space-x-3 mb-4">
                                <div className="flex items-center space-x-1">
                                    <Heart className="text-white w-5 h-5" />
                                    <span className="text-white text-sm">{image.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <MessageCircle className="text-white w-5 h-5" />
                                    <span className="text-white text-sm">{image.comments}</span>
                                </div>
                            </div>

                            {/* Prompt Description */}
                            <p className="text-sm text-gray-500 italic mb-4">
                                Prompt: {image.prompt}
                            </p>

                            {/* Bottom Action Bar */}
                            <div className="flex justify-between items-center w-full border-t border-gray-700 pt-2">
                                <button className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm">
                                    <Edit className="w-4 h-4" />
                                    <span>Edit prompt</span>
                                </button>
                                <button className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm">
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Retry</span>
                                </button>
                                <button className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm">
                                    <Video className="w-4 h-4" />
                                    <span>Create video</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!(loading || isFetchingImage) && !image && (
                    <div className="absolute inset-0 mt-64 flex items-center justify-center text-white text-2xl">
                        <p>
                            {fetchError
                                ? "Error!! Reload the page"
                                : "Image not found"}
                        </p>
                    </div>
                )}
            </div>

            
        </LayoutWrapper>
    );
}