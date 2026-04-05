'use client'

import React, { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const navItems = [
    {name: "Interests", url: "/posts/interests"},
    {name: "Explore", url: "/posts/explore"},
    {name: "Manage Posts", url: "/posts/me"},
]

export default function DashboardNavigation() {
    const pathname = usePathname();

    const [user, setUser] = useState<{name: string} | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/user", {credentials: "include"});
                if(res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
                else {
                    setUser(null);
                }
            }
            catch {
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [pathname]);

    const filteredNavItems = user ? navItems : navItems.filter((item) => item.name !== "Interests" && item.name !== "Manage Posts");

    return (
        <div className = "fixed top-0 left-0 w-full bg-black shadow-lg z-50">
            <div className = "flex justify-center items-center gap-10 py-4">

                <div className="text-white w-1/3 flex justify-start mx-8 font-semibold">
                    HOBBY HUB
                    <div className="text-gray-300">{"-Alpha"}</div>
                </div>

                <div className="flex justify-center items-center gap-10 w-1/3">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.url;
                        
                        return (
                            <Link
                                key = {item.name}
                                href = {item.url}
                                className = 
                                {`
                                    text-sm font-medium px-4 py-2 rounded-2xl transition-all duration-300
                                    ${isActive ? "text-white scale-105 shadow-md" : "text-gray-400 hover:text-white hover:scale-105"}
                                `}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="w-1/3 flex justify-end px-8">
                    {loading ? null : user ? (
                        <Link
                            href="/profile"
                            className="text-sm text-gray-300 hover:text-white transition"
                        >
                            Signed in as{" "}
                            <span className="font-medium text-white">
                                {user.name}
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href = "/login"
                            className="text-sm text-gray-400 hover:text-white transition"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

        </div>
    );
}