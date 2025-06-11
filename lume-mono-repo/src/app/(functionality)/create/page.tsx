"use client";
import Header from "@/components/Header";
import LayoutWrapper from "@/components/LayoutWrapper";
import ImagePromptInput from "@/components/PromptInput";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/lib/types";
import { fetchImages } from "@/utils/fetchImages";
import { useQuery } from "@tanstack/react-query";
import { Download, Heart, Maximize2, X } from "lucide-react";
import { format, parseISO, isValid, isToday, isYesterday } from "date-fns";
import { useMemo, useState } from "react";

// Enhanced type for image with batch information
type Image = {
    _id: string;
    imageUrl: string;
    createdAt: string;
    batchId?: string;
    prompt?: string;
    style?: string;
    aspect?: string;
    variations?: string;
};

// Type for image batch
type ImageBatch = {
    batchId: string;
    prompt: string;
    images: Image[];
    createdAt: string;
    style?: string;
    aspect?: string;
    totalVariations: number;
};

function handleDownload(url: string, filename?: string) {
    try {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || url.split("/").pop() || "image";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("Download failed:", error);
    }
}

function formatDateLabel(dateString: string): string {
    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return "Unknown Date";

        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date, "MMMM d, yyyy");
    } catch {
        return "Unknown Date";
    }
}

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [skeletonRatio, setSkeletonRatio] = useState<AspectRatio>("3:4");
    const [skeletonCount, setSkeletonCount] = useState(0);
    const [likedImages, setLikedImages] = useState<Set<string>>(new Set());

    // Fetch images using React Query
    const {
        data,
        isLoading: isFetchingImages,
        error: fetchError,
        refetch,
    } = useQuery<Image[]>({
        queryKey: ["images"],
        queryFn: async () => {
            const response = await fetchImages();
            return Array.isArray(response) ? response : response?.data || [];
        },
        retry: 2,
        staleTime: 5000,
        refetchOnWindowFocus: false,
    });

    // Group images by batch and date
    const groupedImagesByDate = useMemo(() => {
        if (!data || !Array.isArray(data)) return {};

        // First, group by date
        const dateGroups = data.reduce(
            (groups: { [key: string]: Image[] }, image) => {
                const dateKey = image.createdAt.split("T")[0];
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(image);
                return groups;
            },
            {}
        );

        // Then, within each date, group by batch
        const result: { [key: string]: ImageBatch[] } = {};

        Object.entries(dateGroups).forEach(([dateKey, images]) => {
            const batches: { [key: string]: ImageBatch } = {};

            images.forEach((image) => {
                const batchId = image.batchId || `single-${image._id}`;

                if (!batches[batchId]) {
                    batches[batchId] = {
                        batchId,
                        prompt: image.prompt || "Unknown prompt",
                        images: [],
                        createdAt: image.createdAt,
                        style: image.style,
                        aspect: image.aspect,
                        totalVariations: parseInt(image.variations || "1"),
                    };
                }

                batches[batchId].images.push(image);
            });

            // Sort batches by creation time (newest first)
            result[dateKey] = Object.values(batches).sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        });

        return result;
    }, [data]);

    function handleLike(imageId: string) {
        setLikedImages((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(imageId)) {
                newSet.delete(imageId);
            } else {
                newSet.add(imageId);
            }
            return newSet;
        });
    }

    const isLoading = isFetchingImages || loading;
    const hasData = data && Array.isArray(data) && data.length > 0;
    const hasError = fetchError && !isLoading;

    return (
        <LayoutWrapper>
            <Header />
            <div className='relative w-full min-h-[80vh] px-4 py-4'>
                {/* Loading Skeletons */}
                {isLoading && (
                    <div className='mb-8'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-8'>
                            {Array.from({
                                length: isFetchingImages ? 12 : skeletonCount,
                            }).map((_, idx) => (
                                <Skeleton
                                    key={`skeleton-${idx}`}
                                    style={{
                                        aspectRatio: skeletonRatio.replace(
                                            ":",
                                            "/"
                                        ),
                                    }}
                                    className='bg-zinc-800 rounded-lg p-2'
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Image Grid by Date and Batch */}
             
                    <div>
                        {Object.entries(groupedImagesByDate)
                            .sort(
                                ([a], [b]) =>
                                    new Date(b).getTime() -
                                    new Date(a).getTime()
                            )
                            .map(([dateKey, batches]) => (
                                <div key={dateKey} className='mb-12'>
                                    <h2 className='text-2xl font-semibold text-white mb-6 sticky top-4 py-2 rounded-lg'>
                                        {formatDateLabel(dateKey)}
                                    </h2>

                                    {batches.map((batch) => (
                                        <div
                                            key={batch.batchId}
                                            className='mb-1'
                                        >
                                            {/* Batch Images */}
                                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1'>
                                                {batch.images.map((img) => (
                                                    <div
                                                        key={img._id}
                                                        className='relative group cursor-pointer transform transition-all duration-300'
                                                    >
                                                        <div className='relative overflow-hidden shadow-lg transition-shadow duration-300'>
                                                            <img
                                                                src={
                                                                    img.imageUrl
                                                                }
                                                                alt={`Generated image from prompt: ${batch.prompt}`}
                                                                className='w-full h-full object-cover'
                                                                loading='lazy'
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    const target =
                                                                        e.target as HTMLImageElement;
                                                                    target.style.display =
                                                                        "none";
                                                                }}
                                                            />

                                                            {/* Hover Overlay */}
                                                            <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3'>
                                                                <button
                                                                    className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                                                                    aria-label='View full size'
                                                                >
                                                                    <Maximize2 className='text-white w-5 h-5' />
                                                                </button>

                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleLike(
                                                                            img._id
                                                                        );
                                                                    }}
                                                                    className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                                                                    aria-label='Like image'
                                                                >
                                                                    <Heart
                                                                        className={`w-5 h-5 transition-colors ${
                                                                            likedImages.has(
                                                                                img._id
                                                                            )
                                                                                ? "text-red-500 fill-red-500"
                                                                                : "text-white"
                                                                        }`}
                                                                    />
                                                                </button>

                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(
                                                                            img.imageUrl,
                                                                            `generated-${img._id}.png`
                                                                        );
                                                                    }}
                                                                    className='p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors'
                                                                    aria-label='Download image'
                                                                >
                                                                    <Download className='text-white w-5 h-5' />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                    </div>
            

                {/* Empty State */}
                {!isLoading && !hasData && !hasError && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='text-center'>
                            <div className='text-6xl mb-4'>🎨</div>
                            <p className='text-white text-2xl mb-2'>
                                What do you want to create?
                            </p>
                            <p className='text-zinc-400'>
                                Start by describing your image below
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {!isLoading && hasError && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='text-center'>
                            <div className='text-6xl mb-4'>🔒</div>
                            <p className='text-white text-2xl mb-2'>
                                Unauthorized
                            </p>
                            <p className='text-zinc-400 mb-4'>
                                Please log in to get started
                            </p>
                            <button
                                onClick={() => refetch()}
                                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ImagePromptInput
                setLoading={setLoading}
                loading={loading}
                setSkeletonRatio={setSkeletonRatio}
                setSkeletonCount={setSkeletonCount}
            />
        </LayoutWrapper>
    );
}