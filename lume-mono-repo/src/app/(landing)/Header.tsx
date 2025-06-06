"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "../(auth)/auth-client";
import { handleSignIn } from "../(auth)/action";

export default function Header() {
    const { data } = authClient.useSession();
    return (
        <section id='navigation' className='w-full h-24'>
            <nav className='mx-auto w-full h-full max-w-7xl flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg px-6'>
                {/* Logo */}
                <div>
                    <Link href={"/"}>
                        <h3 className='uppercase text-4xl font-semibold text-white'>
                            Lume
                        </h3>
                    </Link>
                </div>

                {/* Nav Links */}
                <div className='flex gap-8 items-center'>
                    <Link
                        href='#explore'
                        className='text-white text-lg font-medium transition-all duration-300 hover:text-white/80'
                    >
                        Services
                    </Link>
                    <Link
                        href='#blogs'
                        className='text-white text-lg font-medium transition-all duration-300 hover:text-white/80'
                    >
                        Blogs
                    </Link>
                    <Link
                        href='#contact'
                        className='text-white text-lg font-medium transition-all duration-300 hover:text-white/80'
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Sign-in Button */}
                <div>
                    {data ? (
                        <Button
                            variant='default'
                            className='text-xl h-full py-4 px-8 bg-white text-black rounded-md transition-all duration-300 ease-in-out hover:rounded-full hover:bg-white hover:shadow-lg cursor-pointer'
                        >
                            <Link href={"/explore"}>Go to app</Link>
                        </Button>
                    ) : (
                        <Button
                            variant='default'
                            onClick={handleSignIn}
                            className='text-xl h-full py-4 px-8 bg-white text-black rounded-md transition-all duration-300 ease-in-out hover:rounded-full hover:bg-white hover:shadow-lg cursor-pointer'
                        >
                            Sign in
                        </Button>
                    )}
                </div>
            </nav>
        </section>
    );
}
