'use client'

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    {name: "Interests", url: "/interests"},
    {name: "Explore", url: "/explore"},
    {name: "Manage Posts", url: "/posts/me"},
]

export default function DashboardNavigation() {
    const pathname = usePathname();

    return (
        <div className = "fixed top-0 left-0 w-full bg-black shadow-lg z-50">
            <div className = "flex justify-center items-center gap-10 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.url;
                    
                    return (
                        <Link
                            key = {item.name}
                            href = {item.url}
                            className = {`text-sm font-medium px-4 py-2 rounded-2xl transition-all duration-300
                                ${
                                    isActive ? "text-white scale-105 shadow-md" : "text-gray-400 hover:text-white hover:scale-105"
                                }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}