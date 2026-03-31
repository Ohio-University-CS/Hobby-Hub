'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const ViewPostPage = () => {
    const params = useParams();
    const postId = params.id as string;

    const [post, setPost] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

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
                <p className = "text-muted-foreground text-2xl font-semibold">Loading..</p>
            </div>
        );
    }

    if(!post) {
        return (
            <div className = "flex items-center justify-center h-screen">
                <p className = "text-muted-foreground text-2xl font-semibold">Post not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-6 bg-white rounded-2xl shadow shadow-2xl mt-8">

            <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                disabled={false}
                className="bg-black text-white"
            >
                Back
            </Button>

            <h1 className="text-3xl font-bold mb-6">
                {post.title}
            </h1>

            <h1 className="text-xl text-neutral-500 font-bold mb-2">
                {post.user?.name}
            </h1>

            <h1 className="text-xl text-neutral-500 font-bold mb-6">
                {post.createdAt}
            </h1>

            <div className = "rounded-md p-4 bg-neutral-50">
                <div className = "prose max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                    >
                        {post.content || "Nothing to Preview Yet"}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};