'use client';

import React, { useEffect, useState } from "react";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PostCard } from "./post-card";

import { Card, CardContent } from "./ui/card";

export const ManagePostsGrid = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        async function fetchPosts() {
            try {
                const res = await fetch("/api/posts/me", {
                    credentials: "include",
                });

                if (!res.ok) throw new Error("Failed to fetch posts");

                const data = await res.json();
                setPosts(data);
            }
            catch (err: any) {
                console.error(err);
                toast.error(err.message || "Error loading posts");
            }
            finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-muted-foreground text-2xl font-semibold">
                    Loading posts..
                </p>
            </div>
        );
    }

    return (
        <div className="mx-8 mt-4">
            <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr)" }}>
                <Card
                    onClick={() => router.push(`/posts/new`)}
                    className="p-0 bg-white cursor-pointer border-2 border-dashed border-neutral-300 rounded-lg shadow hover:shadow-xl transition flex flex-col overflow-hidden group"
                >
                    {/* Media */}
                    <div className="relative w-full aspect-video bg-neutral-50 flex items-center justify-center border-b border-dashed border-neutral-200">
                        <span className="text-4xl font-light text-neutral-400 group-hover:scale-110 transition-transform">+</span>
                    </div>

                    <div className="p-3 flex items-start space-x-3 opacity-60">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-neutral-200 flex-shrink-0 mt-0.5" />

                        <div className="min-w-0 flex-1 space-y-2">
                            {/* Title */}
                            <div className="h-4 bg-neutral-200 rounded w-3/4" />
                            {/* Subtitle */}
                            <div className="h-3 bg-neutral-100 rounded w-1/2" />
                            <div className="h-3 bg-neutral-50 rounded w-1/4 mb-6" />
                        </div>
                    </div>
                </Card>

                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        router={router}
                        href={`/posts/${post.id}`}
                    />
                ))}
            </div>
        </div>
    );
};