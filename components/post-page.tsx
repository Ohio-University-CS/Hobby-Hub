'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Post {
    id: string;
    title: string;
    content: string;
}

export const ViewPostPage = () => {
    const params = useParams();
    const postId = params.id as string;

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!postId) return;

        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${postId}`, {credentials: "include",});

                if(!res.ok) throw new Error("Failed to fetch post");

                const data = await res.json();

                setPost(data);
            }
            catch (err: any) {
                console.error(err);
                toast.error(err.message || "Error loading post");
            }
            finally {
                setLoading(false);
            }
        }

        if(postId) fetchPost();
    }, [postId]);

    if(loading) {
        return (
            <div className = "flex items-center justify-center h-screen">
                <p className = "text-muted-foreground">Loading post</p>
            </div>
        );
    }

    if(!post) {
        return (
            <div className = "flex items-center justify-center h-screen">
                <p className = "text-muted-foreground">Post not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow shadow-2xl mt-8">
            <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
            <p className="text-lg text-gray-700 whitespace-pre-line">{post.content}</p>
        </div>
    );
};