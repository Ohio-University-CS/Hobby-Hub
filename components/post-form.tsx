'use client';

import React, { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { error } from "console";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export const PostForm = ({ postId }: {postId?: string}) => {
    
    const isEditing = !!postId;

    const [isPending, setIsPending] = useState(false);
    const [loading, setLoading] = useState(isEditing);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [selectedInterests, setSelectedInterests] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [query, setQuery] = useState("");
    
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
                setSelectedInterests(data.interests);
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
    
        if(title.trim().length == 0) return toast.error("Title is required");
        if(content.trim().length == 0) return toast.error("Content is required");
        if(selectedInterests.length === 0) return toast.error("Interests are required")

        try {
            setIsPending(true);

            const res = await fetch(
                isEditing ? `/api/posts/${postId}` : "/api/posts",
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(
                    {
                        title,
                        content,
                        interests: selectedInterests.map(i => i.id)
                    })
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

    async function handleDelete() {
        
        if(!postId) return;

        const confirmed = confirm("Are you sure you want to delete this post?");
        if(!confirmed) return;

        try {
            setIsPending(true);

            const res = await fetch(
                `/api/posts/${postId}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include"
                }
            );

            const data = await res.json();

            if(!res.ok) throw new Error(data.error || "Failed to delete post.");

            toast.success("Post deleted");
            router.push("/posts/me");
        }
        catch (err: any) { toast.error(err.message); }

        finally { setIsPending(false); }
    }

    if(loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground text-2xl font-semibold">Loading..</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">

            <div className="w-full max-w-2xl p-8 space-y-6 border border-neutral-200 rounded-2xl shadow-xl">

                <Button
                    variant="outline"
                    onClick={() => router.push("/posts/me")}
                    className="bg-black text-white"
                >
                    Back
                </Button>
            
                <h1 className="text-2xl font-bold">
                    {isEditing ? "Edit Post" : "Create Post"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        value = {title}
                        onChange = {e => setTitle(e.target.value)}
                        placeholder="Title"
                        className="h-11"    
                    />

                    <div className = "space-y-2">
                        <textarea
                            value = {content}
                            onChange = {e => setContent(e.target.value)}
                            placeholder = "Write your post in markdown.."
                            className = "w-full min-h-[150px] border rounded-md px-3 py-2"
                        />
                    </div>


                    <h1 className="text-2xl font-semibold">
                        Relevant Interests
                    </h1>

                    <Input
                        value={query}
                        onChange={async (e) => {
                            const value = e.target.value;
                            setQuery(value);

                            if(!value) {
                                setSuggestions([]);
                                return;
                            }

                            const res = await fetch(`/api/interests?query=${value}`);
                            const data = await res.json();

                            setSuggestions(data);
                        }}

                        placeholder = "Add relevant interests.."
                    />

                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 w-auto bg-white border rounded-md mt-1 shadow">
                            {suggestions.map((interest) => (
                                <li
                                    key = {interest.id}
                                    className = "px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        if(!selectedInterests.find(i => i.id === interest.id)) {
                                            setSelectedInterests(prev => [...prev, interest]);
                                        }

                                        setQuery("");
                                        setSuggestions([]);
                                    }}
                                >
                                    {interest.name}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className = "flex flex-wrap">
                        {selectedInterests.map((interest) => (
                            <Button
                                key = {interest.id}
                                type = "button"
                                disabled = {isPending}
                                className = "w-full h-11 bg-black text-white inline-flex w-auto h-auto"
                                onClick={() => {
                                    setSelectedInterests(prev => prev.filter(i => i.id !== interest.id));
                                }}
                            >
                                {interest.name}
                            </Button>
                        ))}
                    </div>

                     <h1 className="text-2xl font-semibold">
                        Preview
                    </h1>
                    
                    <div className = "border rounded-md p-4 bg-neutral-50">
                        <div className = "prose max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                            >
                                {content || "Nothing to Preview Yet"}
                            </ReactMarkdown>
                        </div>
                    </div>

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

                    {isEditing && (
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="w-full h-11 bg-red-500 text-white"
                        >
                            Delete
                        </Button>
                        )
                    }
                </form>
            </div>
        </div>
    );
};