'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { PostCard } from "./post-card";

export const ExplorePostsGrid = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        async function fetchPosts() {
            try {
                const res = await fetch("/api/posts/explore", {
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
        )
    }

    if(posts.length === 0) {
        return (
            <div className = "flex items-center justify-center h-screen">
                <p className = "text-muted-foreground text-2xl font-semibold">
                    No posts found
                </p>
            </div>
        );
    }

     return (
        <div className = "p-8">
            <div className = "grid gap-6 justify-start" style={{gridTemplateColumns: "repeat(auto-fit, 400px)"}}>
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