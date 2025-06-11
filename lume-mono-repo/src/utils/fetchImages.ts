import { GeneratedImage, GeneratedImageProps } from "@/lib/types";
import axios, { AxiosError } from "axios";
import debug from "debug";

// dbgr
const dbgr = debug("development:fetchImages");

// Store image function with proper error handling
export const storeImage = async (imageData: GeneratedImageProps) => {

    console.log("Storing image data here: ", imageData);
    
    try {
        const response = await axios.post("/api/v1/images", {
            imageData,
        });

        return { success: true, data: response.data, status: 200 };
    } catch (error) {
        const axiosError = error as AxiosError;
        dbgr(
            "Error occured while storing images: ",
            axiosError.message
        );
        return { success: false, error: axiosError.message, status: 500 };
    }
};

// Fetch images function with proper error handling
export const fetchImages = async () => {
    try {
        const response = await axios.get("/api/v1/images");
        if (!response) return [];

        return { success: true, data: response.data.data, status: 200 };
    } catch (error) {
        const axiosError = error as AxiosError;
        dbgr(
            "Error occured while fetching images -  error:",
            axiosError.message
        );
        return {
            success: false,
            data: [],
            error: axiosError.message,
            status: 500,
        };
    }
};

export const fetchImageById = async (id: string) => {
    try {
        const response = await axios.get(`/api/v1/images/${id}`);

        // Check if the response has valid data
        if (response.status !== 200 || !response.data?.data) {
            dbgr(`No image found for ID: ${id}`);
            return { status: false, data: {}, error: "No image found" };
        }

        return response.data.data as GeneratedImage;
    } catch (error) {
        const axiosError = error as AxiosError;
        dbgr(`Failed to fetch image with ID ${id}:`, axiosError.message);
        return { success: false, error: axiosError.message, status: 500 };
    }
};

// Delete image function
export const deleteImage = async (imageId: string): Promise<void> => {
    try {
        await axios.delete(`/api/images/${imageId}`);
    } catch (error) {
        const axiosError = error as AxiosError;
        dbgr("Failed to delete the image: ", axiosError.message);
    }
};

// Like/Unlike image function
export const toggleLikeImage = async (imageId: string): Promise<void> => {
    try {
        await axios.post(`/api/images/${imageId}/like`);
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        throw new Error(
            axiosError.response?.data?.message || "Failed to toggle like"
        );
    }
};
