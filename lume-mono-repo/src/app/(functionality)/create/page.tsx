"use client";
import Header from "@/components/Header";
import LayoutWrapper from "@/components/LayoutWrapper";
import ImagePromptInput from "@/components/PromptInput";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/lib/types";
import { fetchImages } from "@/utils/fetchImages";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function page() {
    const [loading, setLoading] = useState<boolean>(false);
    const [skeletonRatio, setSkeletonRatio] = useState<AspectRatio>("3:4");
    const [skeletonCount, setSkeletonCount] = useState<number>(0);

    // Fetch images using React Query
    const {
        data,
        isLoading: isFetchingImages,
        error: fetchError,
    } = useQuery({
        queryKey: ["images"],
        queryFn: fetchImages,
        retry: 2,
        staleTime: 1000 * 60 * 5,
    });

    // Sort and group images by date
    const organizedImages = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return {};

        // Sort images by createdAt in descending order (newest first)
        const sortedImages = [...data].sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        });

        // Group images by date
        const grouped = sortedImages.reduce((acc, image) => {
            const date = new Date(image.createdAt);
            const dateKey = date.toDateString(); // Format: "Mon Jan 01 2024"

            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(image);
            return acc;
        }, {} as Record<string, typeof data>);

        return grouped;
    }, [data]);

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        }

        // Check if it's yesterday
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }

        // Format as readable date
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <LayoutWrapper>
            <Header />
            <div className='relative w-full min-h-[80vh] px-4 py-4'>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
                    {isFetchingImages &&
                        Array.from({ length: 10 }).map((_, index) => (
                            <Skeleton
                                key={`skeleton-${index}`}
                                style={{
                                    aspectRatio: skeletonRatio.replace(
                                        ":",
                                        "/"
                                    ),
                                }}
                                className='bg-zinc-800 rounded-none p-2'
                            />
                        ))}
                </div>

                {loading && (
                    <div className='mb-8'>
                        <div className='mb-4'>
                            <h2 className='text-2xl font-semibold text-white border-b border-zinc-700 pb-2'>
                                Generating...
                            </h2>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                            {Array.from({
                                length: skeletonCount,
                            }).map((_, index) => (
                                <Skeleton
                                    key={`skeleton-${index}`}
                                    style={{
                                        aspectRatio: skeletonRatio.replace(
                                            ":",
                                            "/"
                                        ),
                                    }}
                                    className='bg-zinc-800 rounded-none'
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    {Object.keys(organizedImages).length > 0 &&
                        Object.entries(organizedImages).map(
                            ([dateKey, images]) => (
                                <div key={dateKey} className='mb-8'>
                                    {/* Date Header */}
                                    <div className='mb-4'>
                                        <h2 className='text-2xl font-semibold text-white border-b border-zinc-700 pb-2'>
                                            {formatDateHeader(dateKey)}
                                        </h2>
                                    </div>

                                    {/* Images Grid for this date */}
                                    <div className=''>
                                        {images.map((image, index) => (
                                            <Link
                                                href={`/g/${image._id}`}
                                                key={`image-${dateKey}-${index}`}
                                                className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'
                                            >
                                                {image.imageUrls.map(
                                                    (img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className='mb-2'
                                                        >
                                                            <img
                                                                src={img}
                                                                alt={`Generated image ${
                                                                    index * idx
                                                                }`}
                                                                className='w-full shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200'
                                                                loading='lazy'
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                </div>

                {!(loading || isFetchingImages) &&
                    (!data || data.length === 0) && (
                        <div className='absolute inset-0 mt-64 flex items-center justify-center text-white text-2xl'>
                            <p>
                                {fetchError
                                    ? "Error!! Reload the page"
                                    : "What do you want to make?"}
                            </p>
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
