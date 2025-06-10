import React from "react";

interface ClickedImageShowProps {
    image: {
        _id: string;
        imageUrls: string[];
        createdAt: string;
    } | null;
    onClose: () => void;
}

const ClickedImageShow: React.FC<ClickedImageShowProps> = ({
    image,
    onClose,
}) => {
    if (!image) return null;

    return (
        <div className='absolute inset-0 h-screen w-full z-50 flex items-center justify-center bg-black/60'>
            <div className='bg-white rounded shadow-lg p-4 max-w-xl w-full relative'>
                <button
                    onClick={onClose}
                    className='absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-black'
                    aria-label='Close'
                >
                    ×
                </button>
                <div className='flex flex-col items-center'>
                    {image.imageUrls.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Generated image ${idx}`}
                            className='mb-4 rounded max-h-[60vh] object-contain'
                            loading='lazy'
                        />
                    ))}
                    <div className='text-xs text-gray-500 mt-2'>
                        Created at: {new Date(image.createdAt).toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClickedImageShow;
