"use client";

import { Bell, Plus, Telescope, UserCircle } from "lucide-react";
import Link from "next/link";
import { authClient } from "../app/(auth)/auth-client";
import { CurrentPageName } from "../utils/getCurrentPath";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";

export default function Header() {
    const { data } = authClient.useSession();

    const path = CurrentPageName();

    return (
        <nav className='w-full h-16 flex items-center justify-between  text-white '>
            {/* Logo */}
            <Link href='/' className='flex items-center gap-2'>
                <h1 className='text-2xl font-semibold tracking-wide'>Lume</h1>
            </Link>

            {/* Icons */}
            <div className='flex items-center gap-4'>
                <button
                    className='w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition cursor-pointer'
                    aria-label='Create New Image'
                >
                    {path === "CREATE" ? (
                        <Link href={"/explore"}>
                            <Telescope size={20} />
                        </Link>
                    ) : (
                        <Link href='/create'>
                            <Plus size={20} />
                        </Link>
                    )}
                </button>
                <button
                    className='w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition cursor-pointer'
                    aria-label='Notifications'
                >
                    <Bell size={20} />
                </button>
                <button
                    className='w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition overflow-hidden cursor-pointer'
                    aria-label='User Profile'
                >
                    {data ? (
                        <Avatar>
                            <AvatarImage src={data.user.image!} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    ) : (
                        <UserCircle size={20} />
                    )}
                </button>
            </div>
        </nav>
    );
}
