"use client";
import Header from "@/components/Header";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchImages } from "@/utils/fetchImages";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function DashboardPage() {
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

    // If your API returns an object like { success, data: [...] }
    // Otherwise just use: images = data;
    const images = Array.isArray(data)
        ? data
        : data?.data && Array.isArray(data.data)
        ? data.data
        : [];

    if (isFetchingImages) {
        return (
            <LayoutWrapper>
                <Header />
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4'>
                    {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className='aspect-square' />
                    ))}
                </div>
            </LayoutWrapper>
        );
    }

    if (fetchError || images.length === 0) {
        return (
            <LayoutWrapper>
                <Header />
                <p className='text-center text-gray-500 mt-10'>
                    No best images found.
                </p>
            </LayoutWrapper>
        );
    }

    return (
        <LayoutWrapper>
            <div>
                <Header />

                <div className='relative w-full h-full px-4 mb-8 py-4'>
                    <div className='columns-2 sm:columns-3 md:columns-4 max-w-full mx-auto gap-2'>
                        {images.map((image: any, index: number) => (
                            <Link
                                href={`/g/${image._id}`}
                                key={image._id || index}
                            >
                                <img
                                    src={image.imageUrls?.[0] || image.imageUrl}
                                    alt={image.title || `Image ${index + 1}`}
                                    className='shadow-md w-full mb-2'
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </LayoutWrapper>
    );
}
