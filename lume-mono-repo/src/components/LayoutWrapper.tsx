import { cn } from "@/lib/utils";
import React from "react";

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
}

export default function LayoutWrapper({ children, className }: LayoutProps) {
    return (
        <div className={cn("w-full min-h-screen px-6 py-4", className)}>
            {children}
        </div>
    );
}
