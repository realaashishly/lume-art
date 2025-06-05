"use client";
import { usePathname } from "next/navigation";

export function CurrentPageName() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "";

    return lastSegment.toUpperCase();
}
