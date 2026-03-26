'use client';

import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import { Button } from "./ui/button";

export const DebugDashboard = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8 space-y-6">
        <h1 className="text-4xl font-bold mb-8">Alpha Preview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl">
            <Button onClick={() => router.push("/login")} className="w-full">
                Login
            </Button>

            <Button onClick={() => router.push("/register")} className="w-full">
                Register
            </Button>

            <Button onClick={() => router.push("/profile")} className="w-full">
                Profile
            </Button>

            <Button onClick={() => router.push("/posts")} className="w-full">
                All Posts
            </Button>

            <Button onClick={() => router.push("/posts/me")} className="w-full">
                My Posts
            </Button>
        </div>
        </div>
    );
}