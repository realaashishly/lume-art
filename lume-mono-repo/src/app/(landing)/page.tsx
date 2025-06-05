import Header from "@/app/(landing)/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { connectToDatabase } from "@/lib/mongoose";
import { WandSparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
    connectToDatabase();
    return (
        <section className='p-6'>
            <Header />

            <section className='w-full max-w-7xl mx-auto mt-32 px-4 flex flex-col items-center text-center space-y-6'>
                {/* Badge */}
                <Badge variant='outline' className='text-sm px-4 py-1.5'>
                    Lume Image 1.0 Has Arrived 🎉
                </Badge>

                {/* Heading and subheading */}
                <div className='max-w-4xl space-y-6'>
                    <h1 className='text-6xl md:text-7xl font-bold leading-[1.2]'>
                        Visual Magic. AI-Powered. Absolutely Free.
                    </h1>

                    <h5 className='text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed'>
                        Whether you're building a story, brand, or vision — your
                        images start here, powered by AI and free forever.
                    </h5>
                </div>

                {/* Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 mt-4'>
                    <Button className='rounded-full text-md px-6 py-2 h-12 flex items-center justify-center'>
                        <Link href='#'>Explore</Link>
                    </Button>

                    <Button
                        className='rounded-full text-md px-6 py-2 h-12'
                        variant='outline'
                    >
                        <Link
                            href='#'
                            className='flex items-center justify-center gap-2'
                        >
                            <WandSparkles size={18} />
                            <span>Start Generating</span>
                        </Link>
                    </Button>
                </div>
            </section>
        </section>
    );
}
