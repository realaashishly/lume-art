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
import { aspectMap, imageOptions } from "@/lib/constant";
import { AspectRatio, formSchema, FormValues } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowUp, Ghost, LoaderCircle, WandSparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Store image function with proper typing
const storeImage = async (imageData: {
    prompt: string;
    title?: string;
    imageUrls: string[];
    aspect: AspectRatio;
    variations: string;
    enhance: boolean;
    style?: string;
}): Promise<void> => {
    await axios.post("/api/v1/images", imageData);
};

export default function ImagePromptInput({
    setLoading,
    loading,
    setSkeletonCount,
    setSkeletonRatio,
}: {
    setLoading: (loading: boolean) => void;
    loading: boolean;
    setSkeletonRatio: (skeletonratio: AspectRatio) => void;
    setSkeletonCount: (skeletonCount: number) => void;
}) {
    const [isEnhanceOn, setIsEnhanceOn] = useState<boolean>(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
            variations: "4",
            aspect: "2:3",
            style: "realistic",
        },
    });

    const queryClient = useQueryClient();

    // Store images using React Query mutation
    const { mutate: storeImageMutation, isPending: isStoringImages } =
        useMutation({
            mutationFn: storeImage,
            onError: (error) => {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                console.error("Error storing image:", errorMessage);
                toast("Error", {
                    description: "Failed to store images. Please try again.",
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["images"] });
            },
        });

    // Update skeleton size based on form aspect ratio
    const handleSkeletonSize = useCallback(() => {
        const selectedAspect = form.getValues("aspect") as AspectRatio;
        setSkeletonRatio(selectedAspect);
    }, [form]);

    // Handle form submission
    const onSubmit = useCallback(
        async (values: FormValues) => {
            try {
                setLoading(true);
                const { prompt, variations, aspect, style } = values;
                const { width, height } = aspectMap[aspect];

                if (!prompt || !variations || !aspect) {
                    toast("Error", {
                        description: "All required fields must be filled.",
                    });
                    return;
                }

                setSkeletonCount(parseInt(variations));

                // Generate title for image
                // const titleResponse = await axios.post("/api/v1/title", {
                //     prompt,
                // });

                // const title =
                //     (await titleResponse.data.title) || prompt.slice(0, 10);

                // const title = prompt.slice(1, 10);

                // Generate images concurrently
                const imagePromises = Array.from(
                    { length: parseInt(variations) },
                    () =>
                        axios.post<{ image?: string }>("/api/v1/create", {
                            prompt,
                            width,
                            height,
                            enhance: isEnhanceOn,
                            style,
                        })
                );

                const responses = await Promise.all(imagePromises);
                const generatedImages: string[] = [];

                responses.forEach((res, index) => {
                    const imageUrl = res.data.image;
                    if (!imageUrl) {
                        console.log(`No image URL in response ${index + 1}`);
                        return;
                    }
                    generatedImages.push(imageUrl);
                });

                if (generatedImages.length === 0) {
                    throw new Error("No images were generated successfully");
                }

                // Store the generated image data
                storeImageMutation({
                    prompt,
                    imageUrls: generatedImages,
                    aspect,
                    variations,
                    enhance: isEnhanceOn,
                    style,
                });

                toast("Success", {
                    description: `${generatedImages.length} image(s) generated successfully.`,
                });

                form.resetField("prompt");
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                console.error("Error submitting form:", errorMessage);
                toast("Error", {
                    description: "Failed to generate images. Please try again.",
                });
            } finally {
                setLoading(false);
                setSkeletonCount(0);
                handleSkeletonSize();
            }
        },
        [isEnhanceOn, storeImageMutation, handleSkeletonSize, setLoading, form]
    );

    return (
        <div className='w-full relative'>
            <div
                id='promptInput'
                className='w-[700px] fixed bottom-3 left-0 right-0 mx-auto mt-10 p-4 bg-zinc-800 rounded-2xl shadow-md'
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
                                                    form.handleSubmit(
                                                        onSubmit
                                                    )();
                                                }
                                            }}
                                            placeholder='Describe your image...'
                                            className='w-full resize-none min-h-2 border-none dark:bg-transparent focus:bg-transparent focus:ring-0 focus:border-none focus-visible:ring-0'
                                            aria-label='Image description input'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex items-center justify-between'>
                            <div className='flex flex-row items-center gap-2'>
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
                                                            <SelectItem value='1:1'>
                                                                1:1 (Square)
                                                            </SelectItem>
                                                            <SelectItem value='3:2'>
                                                                3:2 (Landscape)
                                                            </SelectItem>
                                                            <SelectItem value='2:3'>
                                                                2:3 (Portrait)
                                                            </SelectItem>
                                                            <SelectItem value='4:3'>
                                                                4:3 (Standard)
                                                            </SelectItem>
                                                            <SelectItem value='3:4'>
                                                                3:4 (Portrait)
                                                            </SelectItem>
                                                            <SelectItem value='16:9'>
                                                                16:9
                                                                (Widescreen)
                                                            </SelectItem>
                                                            <SelectItem value='9:16'>
                                                                9:16 (Mobile
                                                                Portrait)
                                                            </SelectItem>
                                                            <SelectItem value='21:9'>
                                                                21:9
                                                                (Ultra-Wide)
                                                            </SelectItem>
                                                            <SelectItem value='9:21'>
                                                                9:21 (Tall
                                                                Ultra-Wide)
                                                            </SelectItem>
                                                            <SelectItem value='5:4'>
                                                                5:4
                                                            </SelectItem>
                                                            <SelectItem value='4:5'>
                                                                4:5
                                                            </SelectItem>
                                                            <SelectItem value='7:5'>
                                                                7:5
                                                            </SelectItem>
                                                            <SelectItem value='5:7'>
                                                                5:7
                                                            </SelectItem>
                                                            <SelectItem value='2:1'>
                                                                2:1 (Banner)
                                                            </SelectItem>
                                                            <SelectItem value='1:2'>
                                                                1:2
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
                                                            {imageOptions.map(
                                                                (opt) => (
                                                                    <SelectItem
                                                                        key={
                                                                            opt.value
                                                                        }
                                                                        value={
                                                                            opt.value
                                                                        }
                                                                    >
                                                                        {
                                                                            opt.label
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
                                                            <SelectItem value='realistic'>
                                                                Realistic
                                                            </SelectItem>
                                                            <SelectItem value='cartoon'>
                                                                Cartoon
                                                            </SelectItem>
                                                            <SelectItem value='abstract'>
                                                                Abstract
                                                            </SelectItem>
                                                            <SelectItem value='painting'>
                                                                Painting
                                                            </SelectItem>
                                                            <SelectItem value='sketch'>
                                                                Sketch
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div
                                    className={`p-[0.5rem] rounded-md text-sm cursor-pointer text-white flex items-center gap-1 ${
                                        isEnhanceOn
                                            ? "bg-input/60"
                                            : "bg-input/30"
                                    }`}
                                    onClick={() => setIsEnhanceOn(!isEnhanceOn)}
                                    role='button'
                                    aria-label={`Toggle enhance ${
                                        isEnhanceOn ? "on" : "off"
                                    }`}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
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
                                    <span>{isEnhanceOn ? "on" : "off"}</span>
                                </div>
                            </div>

                            <button
                                type='submit'
                                className='px-4 py-2 rounded-md bg-input/60 text-white font-semibold cursor-pointer hover:bg-input/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                disabled={
                                    !form.formState.isValid ||
                                    loading ||
                                    isStoringImages
                                }
                                aria-label='Submit image generation form'
                            >
                                {loading || isStoringImages ? (
                                    <LoaderCircle
                                        size={18}
                                        className='animate-spin'
                                        aria-hidden='true'
                                    />
                                ) : (
                                    <ArrowUp size={18} aria-hidden='true' />
                                )}
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
