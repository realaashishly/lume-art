"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { aspectOptions, imageCount, styleOptions } from "@/contant";
import { aspectMap } from "@/lib/constant";
import { AspectRatio, formSchema, FormValues } from "@/lib/types";
import { storeImage } from "@/utils/fetchImages";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
    ArrowUp,
    Ghost,
    LoaderCircle,
    WandSparkles,
    CheckCircle,
} from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import debug from "debug";
import { v4 as uuid } from "uuid";

// Debug logger
const dbgr = debug("development:PromptInput");

type Props = {
    setLoading: (loading: boolean) => void;
    loading: boolean;
    setSkeletonRatio: (skeletonratio: AspectRatio) => void;
    setSkeletonCount: (skeletonCount: number) => void;
};

type GenerationProgress = {
    total: number;
    completed: number;
    failed: number;
    status: "idle" | "generating" | "storing" | "complete" | "error";
};

export default function ImagePromptInput(props: Props) {
    const { setLoading, loading, setSkeletonCount, setSkeletonRatio } = props;

    const [isEnhanceOn, setIsEnhanceOn] = useState<boolean>(false);
    const [progress, setProgress] = useState<GenerationProgress>({
        total: 0,
        completed: 0,
        failed: 0,
        status: "idle",
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
            variations: "4",
            aspect: "2:3",
            style: "default",
        },
    });

    const queryClient = useQueryClient();

    const handleSkeletonSize = useCallback(() => {
        setSkeletonRatio(form.getValues("aspect") as AspectRatio);
    }, [form, setSkeletonRatio]);

    const resetProgress = () => {
        setProgress({
            total: 0,
            completed: 0,
            failed: 0,
            status: "idle",
        });
    };

    const cancelGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setLoading(false);
        setSkeletonCount(0);
        resetProgress();
        toast.info("Generation cancelled");
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Reset any previous state
            resetProgress();
            setLoading(true);

            const { prompt, variations, aspect, style } = values;
            const variationCount = parseInt(variations);

            if (isNaN(variationCount) || variationCount <= 0) {
                throw new Error("Invalid number of variations");
            }

            // Create abort controller for cancellation
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            // Generate unique batch ID
            const batchId = uuid();

            // Initialize progress
            setProgress({
                total: variationCount,
                completed: 0,
                failed: 0,
                status: "generating",
            });

            setSkeletonCount(variationCount);
            handleSkeletonSize();

            const { width, height } = aspectMap[aspect] || {
                width: 512,
                height: 512,
            };
            const generatedImages: string[] = [];
            const failedImages: number[] = [];

            // Create promises for all image generations
            const promises = Array.from(
                { length: variationCount },
                async (_, index) => {
                    try {
                        if (signal.aborted) {
                            throw new Error("Generation was cancelled");
                        }

                        const response = await axios.post(
                            "/api/v1/create",
                            {
                                prompt,
                                width,
                                height,
                                enhance: isEnhanceOn,
                                style,
                            },
                            { signal }
                        );

                        if (response?.data?.image) {
                            generatedImages.push(response.data.image);

                            // Update progress
                            setProgress((prev) => ({
                                ...prev,
                                completed: prev.completed + 1,
                            }));

                            // // Reduce skeleton count as images complete
                            // setSkeletonCount(
                            //     Math.max(
                            //         0,
                            //         variationCount - generatedImages.length
                            //     )
                            // );

                            return {
                                success: true,
                                imageUrl: response.data.image,
                                index,
                            };
                        } else {
                            throw new Error("No image URL in response");
                        }
                    } catch (error) {
                        if (axios.isCancel(error) || signal.aborted) {
                            throw error; // Re-throw cancellation errors
                        }

                        failedImages.push(index);
                        setProgress((prev) => ({
                            ...prev,
                            failed: prev.failed + 1,
                        }));

                        dbgr(
                            `Image generation failed for index ${index}:`,
                            error
                        );
                        return {
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : "Unknown error",
                            index,
                        };
                    }
                }
            );

            // Wait for all generations to complete
            const results = await Promise.allSettled(promises);

            // Check if operation was cancelled
            if (signal.aborted) {
                return;
            }

            // Filter successful results
            const successfulResults = results
                .filter(
                    (
                        result
                    ): result is PromiseFulfilledResult<{
                        success: true;
                        imageUrl: string;
                        index: number;
                    }> => result.status === "fulfilled" && result.value.success
                )
                .map((result) => result.value);

            if (successfulResults.length === 0) {
                throw new Error("No images were generated successfully");
            }

            // Update progress to storing phase
            setProgress((prev) => ({
                ...prev,
                status: "storing",
            }));

            // Store all successful images in batch
            const storePromises = successfulResults.map((result) =>
                storeImage({
                    batchId,
                    prompt,
                    imageUrl: result.imageUrl,
                    style,
                    aspect,
                    variations,
                    enhance: isEnhanceOn,
                })
            );

            // Wait for all images to be stored
            await Promise.allSettled(storePromises);

            // Update progress to complete
            setProgress((prev) => ({
                ...prev,
                status: "complete",
            }));

            // Show success message
            const successCount = successfulResults.length;
            const failedCount = failedImages.length;

            if (failedCount > 0) {
                toast.warning(`Generated ${successCount} images`, {
                    description: `${failedCount} images failed to generate`,
                });
            } else {
                toast.success(`Successfully generated ${successCount} images!`);
            }

            // Clear the form
            form.resetField("prompt");

            // Invalidate queries to refresh the gallery
            queryClient.invalidateQueries({ queryKey: ["images"] });

            console.log("Generated images:", generatedImages);
            return generatedImages;
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request was cancelled");
                return;
            }

            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            dbgr("Error occurred while submitting form:", errorMessage);

            setProgress((prev) => ({
                ...prev,
                status: "error",
            }));

            toast.error("Generation failed", {
                description: "Failed to generate images. Please try again.",
            });

            return null;
        } finally {
            setLoading(false);
            setSkeletonCount(0);
            abortControllerRef.current = null;

            // Reset progress after a delay
            setTimeout(() => {
                resetProgress();
            }, 3000);
        }
    }

    const getProgressText = () => {
        const { status, completed, total, failed } = progress;

        switch (status) {
            case 'generating':
                return `Generating ${completed}/${total} images${failed > 0 ? ` (${failed} failed)` : ''}`;
            case 'storing':
                return 'Saving images...';
            case 'complete':
                return `✅ Generated ${completed} images successfully!`;
            case 'error':
                return '❌ Generation failed';
            default:
                return '';
        }
    };

    const progressPercentage = progress.total > 0
        ? ((progress.completed + progress.failed) / progress.total) * 100
        : 0;

    return (
        <div className='w-full relative'>
            {/* Progress Bar */} 
             {progress.status !== 'idle' && (
                <div className='fixed top-2 left-1/2 transform -translate-x-1/2 bg-zinc-800 rounded-lg p-4 shadow-lg border border-zinc-700 z-40'>
                    <div className='flex items-center justify-between mb-2'>
                        <span className='text-white text-sm font-medium'>
                            {getProgressText()}
                        </span>
                        {loading && (
                            <button
                                onClick={cancelGeneration}
                                className='text-red-400 hover:text-red-300 text-sm ml-4 cursor-pointer'
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                    <div className='w-64 bg-zinc-700 rounded-full h-2'>
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                                progress.status === 'complete' 
                                    ? 'bg-green-500' 
                                    : progress.status === 'error'
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            <div
                id='promptInput'
                className='w-[700px] fixed bottom-3 left-0 right-0 mx-auto mt-10 p-4 bg-zinc-800 rounded-2xl shadow-md border border-zinc-700'
                role='form'
                aria-label='Image generation form'
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-2'
                    >
                        <FormField
                            control={form.control}
                            name='prompt'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" &&
                                                    !e.shiftKey
                                                ) {
                                                    e.preventDefault();
                                                    if (!loading) {
                                                        form.handleSubmit(
                                                            onSubmit
                                                        )();
                                                    }
                                                }
                                            }}
                                            placeholder='Describe your image...'
                                            className='w-full resize-none min-h-2 border-none dark:bg-transparent focus:bg-transparent focus:ring-0 focus:border-none focus-visible:ring-0 text-white placeholder-zinc-400'
                                            aria-label='Image description input'
                                            disabled={loading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex items-center justify-between'>
                            <div className='flex flex-row items-center gap-2'>
                                {/* Style Selection */}
                                <FormField
                                    control={form.control}
                                    name='style'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger
                                                        className='w-fit bg-zinc-700 text-white border-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md shadow-sm'
                                                        aria-label='Select image style'
                                                    >
                                                        <SelectValue placeholder='Select style' />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-zinc-700 text-white border-none shadow-lg'>
                                                        <SelectGroup>
                                                            <SelectLabel className='text-gray-300'>
                                                                Image Style
                                                            </SelectLabel>
                                                            {styleOptions.map(
                                                                (style) => (
                                                                    <SelectItem
                                                                        key={
                                                                            style.id
                                                                        }
                                                                        value={
                                                                            style.value
                                                                        }
                                                                    >
                                                                        {
                                                                            style.label
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Aspect Ratio Selection */}
                                <FormField
                                    control={form.control}
                                    name='aspect'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        handleSkeletonSize();
                                                    }}
                                                    value={field.value}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger
                                                        className='w-fit bg-zinc-700 text-white border-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md shadow-sm'
                                                        aria-label='Select aspect ratio'
                                                    >
                                                        <SelectValue placeholder='Select aspect ratio' />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-zinc-700 text-white border-none shadow-lg'>
                                                        <SelectGroup>
                                                            <SelectLabel className='text-gray-300'>
                                                                Aspect Ratio
                                                            </SelectLabel>
                                                            {aspectOptions.map(
                                                                (aspect) => (
                                                                    <SelectItem
                                                                        key={
                                                                            aspect.id
                                                                        }
                                                                        value={
                                                                            aspect.value
                                                                        }
                                                                    >
                                                                        {
                                                                            aspect.label
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Variations Count Selection */}
                                <FormField
                                    control={form.control}
                                    name='variations'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                    disabled={loading}
                                                >
                                                    <SelectTrigger
                                                        className='w-fit bg-zinc-700 text-white border-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md shadow-sm'
                                                        aria-label='Select number of variations'
                                                    >
                                                        <SelectValue placeholder='Select variations' />
                                                    </SelectTrigger>
                                                    <SelectContent className='bg-zinc-700 text-white border-none shadow-lg'>
                                                        <SelectGroup>
                                                            <SelectLabel className='text-gray-300'>
                                                                Variations
                                                            </SelectLabel>
                                                            {imageCount.map(
                                                                (img) => (
                                                                    <SelectItem
                                                                        key={
                                                                            img.label
                                                                        }
                                                                        value={
                                                                            img.value
                                                                        }
                                                                    >
                                                                        {
                                                                            img.label
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Enhance Toggle */}
                                <div
                                    className={`p-[0.5rem] rounded-md text-sm cursor-pointer text-white flex items-center gap-1 transition-all duration-200 ${
                                        isEnhanceOn
                                            ? "bg-blue-600/60 hover:bg-blue-600/80"
                                            : "bg-zinc-700/60 hover:bg-zinc-700/80"
                                    } ${
                                        loading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        !loading && setIsEnhanceOn(!isEnhanceOn)
                                    }
                                    role='button'
                                    aria-label={`Toggle enhance ${
                                        isEnhanceOn ? "on" : "off"
                                    }`}
                                    tabIndex={loading ? -1 : 0}
                                    onKeyDown={(e) => {
                                        if (
                                            !loading &&
                                            (e.key === "Enter" || e.key === " ")
                                        ) {
                                            e.preventDefault();
                                            setIsEnhanceOn(!isEnhanceOn);
                                        }
                                    }}
                                >
                                    <span>
                                        {isEnhanceOn ? (
                                            <WandSparkles
                                                size={18}
                                                aria-hidden='true'
                                            />
                                        ) : (
                                            <Ghost
                                                size={18}
                                                aria-hidden='true'
                                            />
                                        )}
                                    </span>
                                    <span>Enhance</span>
                                    <span
                                        className={`px-1 py-0.5 rounded text-xs ${
                                            isEnhanceOn
                                                ? "bg-blue-500/50"
                                                : "bg-zinc-600/50"
                                        }`}
                                    >
                                        {isEnhanceOn ? "ON" : "OFF"}
                                    </span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type='submit'
                                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 ${
                                    loading
                                        ? "bg-red-600/60 hover:bg-red-600/80 text-white"
                                        : !form.formState.isValid
                                        ? "bg-zinc-600/50 text-zinc-400 cursor-not-allowed"
                                        : "bg-blue-600/60 hover:bg-blue-600/80 text-white hover:shadow-lg"
                                }`}
                                disabled={!form.formState.isValid && !loading}
                                aria-label={
                                    loading
                                        ? "Cancel generation"
                                        : "Submit image generation form"
                                }
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className='animate-spin'
                                            aria-hidden='true'
                                        />
                                        <span className='hidden sm:inline'>
                                            Cancel
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowUp size={18} aria-hidden='true' />
                                        <span className='hidden sm:inline'>
                                            Generate
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}