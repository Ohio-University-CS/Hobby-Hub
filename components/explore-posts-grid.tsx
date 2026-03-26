'use client';

import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import {Card, CardContent} from "./ui/card";

interface Post {
    id: string;
    title: string;
    content: string;
}

export const ExplorePostsGrid = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        async function fetchPosts() {
            try {
                const res = await fetch("/api/posts", {
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
                <p className = "text-muted-foreground">Loading posts..</p>
            </div>
        )
    }

    if(posts.length === 0) {
        return (
            <div className = "flex items-center justify-center h-screen">
                <p className = "text-muted-foreground">No posts found</p>
            </div>
        );
    }

     return (
        <div className = "p-8">
            <h1 className = "text-2xl font-semibold mb-6">Posts</h1>

            <div className = "grid gap-6 justify-start" style={{gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))"}}>
                {posts.map(post=> (
                    <Card
                        key = {post.id}
                        onClick = {() => router.push(`/posts/${post.id}`)}
                        className = "cursor-pointer bg-white border border-neutral-200 rounded-lg shadow hover:shadow-2xl transition flex flex-col items-center justify-center text-center text-lg font-medium overflow-hidden aspect-[4/3]"
                    >
                        <CardContent>
                            {post.title}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};