'use client';

import Link from "next/link";
import { Button } from "./ui/button";

export const LandingPage = () => {
    return (
        <section className = "flex flex-col items-center justify-center px-6 py-24">
            <div className = "max-w-3xl w-full text-center flex flex-col items-center space-y-4">

                <div className = "relative">
                    <img
                        src="/assets/HobbyHubLight.png"
                        alt="Logo"
                        className="w-80 mx-auto"
                    />
                </div>

                <h1 className = "text-5xl font-extrabold text-neutral-800">
                    Share your hobbies.
                </h1>

                <p className = "text-lg text-neutral-600 max-w-lg mx-auto">
                    Create posts to showcase your projects and connect with an ever-growing community of makers.
                </p>

                <div className = "flex flex-row items-center justify-center gap-2">
                    <Link href="/posts/explore">
                        <Button variant = "outline" className = "px-6 py-2 bg-black text-white hover:bg-black/90">
                            Explore
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant = "outline" className = "px-6 py-2 bg-black text-white hover:bg-black/90">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};