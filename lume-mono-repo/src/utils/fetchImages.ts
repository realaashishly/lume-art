import { AspectRatio, GeneratedImage } from "@/lib/types";
import axios, { AxiosError } from "axios";

// Store image function with proper error handling
export const storeImage = async (imageData: {
    prompt: string;
    title: string;
    imageUrls: string[];
    aspect: AspectRatio;
    variations: string;
    enhance: boolean;
    style?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
        const response = await axios.post("/api/store-image", {
            ...imageData,
            aspectRatio: imageData.aspect, // Map to schema field name
        });
        return { success: true, data: response.data };
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = (axiosError.response?.data as { message?: string })?.message || 
                           axiosError.message || 
                           "Failed to store image";
        console.error("Store image error:", errorMessage);
        return { success: false, error: errorMessage };
    }
};

// Fetch images function with proper error handling
export const fetchImages = async (): Promise<GeneratedImage[]> => {
    try {
        const response = await axios.get("/api/v1/images");
        console.log("FetchImage Response: ", response);

        if(!response) return [];
        
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Fetch images error:", axiosError.message);
        throw new Error("Failed to fetch images");
    }
};

// Delete image function
export const deleteImage = async (imageId: string): Promise<void> => {
    try {
        await axios.delete(`/api/images/${imageId}`);
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        throw new Error(axiosError.response?.data?.message || "Failed to delete image");
    }
};

// Like/Unlike image function
export const toggleLikeImage = async (imageId: string): Promise<void> => {
    try {
        await axios.post(`/api/images/${imageId}/like`);
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        throw new Error(axiosError.response?.data?.message || "Failed to toggle like");
    }
};

// Generate image title function
export const generateImageTitle = async (prompt: string): Promise<string> => {
    try {
        const response = await axios.post("/api/v1/title", { prompt });
        return response.data.title || prompt.slice(0, 50);
    } catch (error) {
        console.error("Failed to generate title:", error);
        return prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');
    }
};