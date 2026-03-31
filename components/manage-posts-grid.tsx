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

                if(!res.ok) throw new Error("Failed to fetch posts");

                const data = await res.json();
                setPosts(data);
            }
            catch(err: any) {
                console.error(err);
                toast.error(err.message || "Error loading posts");
            }
            finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    if(loading) {
        return (
            <div className = "flex items-center justify-center h-screen">
                <p className = "text-muted-foreground text-2xl font-semibold">
                    Loading posts..
                </p>
            </div>
        );
    }

    return (
        <div className = "p-8">
            <div className = "grid gap-6 justify-start" style={{gridTemplateColumns: "repeat(auto-fit, 400px)"}}>
                <Card
                    onClick={() => router.push(`/posts/new`)}
                    className="cursor-pointer border-dashed border-2 border-neutral-300 rounded-lg shadow hover:shadow-2xl transition flex flex-col items-center justify-center text-center text-lg font-medium overflow-hidden aspect-[4/3]"
                >
                    <CardContent>
                        + New Post
                    </CardContent>
                </Card>

                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        router={router}
                    />
                ))}
            </div>
        </div>
    );
};