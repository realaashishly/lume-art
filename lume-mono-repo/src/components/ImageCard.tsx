import Image from "next/image";

interface ImageCardProps {
    image: {
        imageUrls: string[];
        title?: string;
    };
}

export default function ImageCard({ image }: ImageCardProps) {
    return (
        <div className='rounded-lg overflow-hidden shadow-md hover:shadow-lg transition'>
            <Image
                src={image.imageUrls[0]} // or optimized field
                alt={image.title || "Generated image"}
                width={400}
                height={400}
                className='w-full h-auto object-cover'
            />
        </div>
    );
}
