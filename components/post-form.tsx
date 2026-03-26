'use client';

import React, { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { error } from "console";

interface PostFormProps {
    postId?: string;
}

export const PostForm = ({ postId }: PostFormProps) => {
    
    const isEditing = !!postId;

    const [isPending, setIsPending] = useState(false);
    const [loading, setLoading] = useState(isEditing);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    
    const router = useRouter();

    useEffect(() => {
        if (!isEditing) return;

        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${postId}`, {credentials: "include"});
                if(!res.ok) throw new Error();

                const data = await res.json();

                setTitle(data.title);
                setContent(data.content);
            }
            catch {
                toast.error("Failed to load post");
            }
            finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [postId, isEditing]);

    async function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
        evt.preventDefault();
    
        if(!title) return toast.error("Title is required");
        if(!content) return toast.error("Content is required");

        try {
            setIsPending(true);

            const res = await fetch(
                isEditing ? `/api/posts/${postId}` : "/api/posts",
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify({title, content}),
                    credentials: "include"
                }
            );

            const data = await res.json();

            if(!res.ok) throw new Error(data.error || "Something Went Horricially Wrong!");

            toast.success(isEditing ? "Post Updated!" : "Post Created!");

            router.push(`/posts/${data.id}`);
        }

        catch (err: any) { toast.error(err.message); }

        finally { setIsPending(false); }
    }

    if(loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Loading!!</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-2xl p-8 space-y-6 border border-neutral-200 rounded-2xl shadow-xl">
                <h1 className="text-2xl font-semibold">
                    {isEditing ? "Edit Post" : "Create Post"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        value = {title}
                        onChange = {e => setTitle(e.target.value)}
                        placeholder="Title"
                        className="h-11"    
                    />

                    <Input
                        value = {content}
                        onChange = {e => setContent(e.target.value)}
                        placeholder="Content"
                        className="w-full border rounded-md px-3 py-2"    
                    />

                    <Button
                        type = "submit"
                        disabled = {isPending}
                        className="w-full h-11 bg-black text-white"
                    >
                        {isPending ? 
                            (isEditing ? "Saving.." : "Creating..")
                            : (isEditing ? "Save Post" : "Create Post")
                        }
                    </Button>
                </form>
            </div>
        </div>
    );
};