'use client';

import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "./ui/card";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

import { CSS } from '@dnd-kit/utilities';

const SortableMediaCard = ({ id, url, onRemove }: { id: string, url: string, onRemove: (id: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group flex-shrink-0">
            <Card className="w-40 h-40 overflow-hidden border-2 border-neutral-200 shadow-md">
                <img src={url} alt="upload-preview" className="w-full h-full object-cover" />
            </Card>
        </div>
    )
}

export const PostForm = ({ postId }: { postId?: string }) => {

    const isEditing = !!postId;

    const [isPending, setIsPending] = useState(false);
    const [loading, setLoading] = useState(isEditing);

    const [title, setTitle] = useState("");
    const [media, setMedia] = useState<{ id: string, url: string, blob: Blob }[]>([]);

    const [content, setContent] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<any[]>([]);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [query, setQuery] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const router = useRouter();

    useEffect(() => {
        if (!isEditing) return;

        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${postId}`, { credentials: "include" });
                if (!res.ok) throw new Error();

                const data = await res.json();

                setTitle(data.title);
                setContent(data.content);
                setSelectedInterests(data.interests);

                if (data.media) {
                    setMedia(data.media.map((m: string, i: number) => ({
                        id: `${i}`,
                        url: m,
                        blob: null
                    })));
                }
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

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 10485760;

        if (file.size > MAX_SIZE) {
            return toast.error("File size is too large. Maximum size is 10MB.");
        }

        const previewURL = URL.createObjectURL(file);

        setMedia(prev => [...prev, {
            id: Date.now().toString(),
            url: previewURL,
            blob: file
        }
        ]);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setMedia((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    async function handleSubmit(evt: React.SubmitEvent<HTMLFormElement>) {
        evt.preventDefault();

        if (title.trim().length == 0) return toast.error("Title is required");
        if (content.trim().length == 0) return toast.error("Content is required");
        if (selectedInterests.length === 0) return toast.error("Interests are required")

        try {
            setIsPending(true);

            const uploadPromises = media.map(async (item) => {
                // Skip upload if it is an already uploaded image
                if (item.url.startsWith('http')) return item.url;

                const signatureResponse = await fetch(`/api/media/image`);
                const { signature, timestamp } = await signatureResponse.json();

                console.log("HELLO!!", signatureResponse!);

                const formData = new FormData();
                formData.append("file", item.blob);
                formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
                formData.append("signature", signature);
                formData.append("timestamp", timestamp);
                formData.append("folder", "image");

                const cloudResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    { method: "POST", body: formData }
                );


                const data = await cloudResponse.json();
                console.log("HELLO!!", data!);
                return data.secure_url;
            });

            const finalMediaArray = await Promise.all(uploadPromises);

            const res = await fetch(
                isEditing ? `/api/posts/${postId}` : "/api/posts",
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(
                        {
                            title,
                            content,
                            interests: selectedInterests.map(i => i.id),
                            media: finalMediaArray
                        })
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Something Went Horrifically Wrong!");

            toast.success(isEditing ? "Post Updated!" : "Post Created!");

            router.push(`/posts/${data.id}`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsPending(false);
        }
    }

    async function handleDelete() {

        if (!postId) return;

        const confirmed = confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;

        try {
            setIsPending(true);

            const res = await fetch(
                `/api/posts/${postId}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to delete post.");

            toast.success("Post deleted");
            router.back();
        }
        catch (err: any) { toast.error(err.message); }

        finally { setIsPending(false); }
    }

    if (loading) return <div className="flex items-center justify-center h-screen font-bold text-xl">Loading..</div>;

    return (
        <div className="flex items-center justify-center">

            <div className="w-full max-w-2xl p-8 space-y-6 border border-neutral-200 rounded-2xl shadow-xl">

                <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                    className="bg-black text-white"
                >
                    Back
                </Button>

                <h1 className="text-2xl font-bold">
                    {isEditing ? "Edit Post" : "Create Post"}
                </h1>

                <div className="w-full overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide">
                    <div className="flex items-center space-x-4 min-w-max px-2">

                        <label className="cursor-pointer border-dashed border-2 border-neutral-300 rounded-lg w-40 h-40 flex flex-col items-center justify-center text-neutral-500 hover:bg-neutral-50 transition flex-shrink-0">
                            <span className="text-3xl font-light">+</span>
                            <span className="text-xs mt-1">Add Media</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
                        </label>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToHorizontalAxis]}
                        >
                            <SortableContext items={media.map(m => m.id)} strategy={horizontalListSortingStrategy}>
                                {media.map((item) => (
                                    <SortableMediaCard
                                        key={item.id}
                                        id={item.id}
                                        url={item.url}
                                        onRemove={(id) => setMedia(prev => prev.filter(m => m.id !== id))}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">

                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Title"
                        className="h-11"
                    />

                    <Tabs defaultValue="edit" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-2 flex">
                            <TabsTrigger value="edit" className="border-1 border-black text-black bg-neutral-100 data-[state=active]:text-white data-[state=active]:bg-black">Edit</TabsTrigger>
                            <TabsTrigger value="preview" className="border-1 border-black text-black bg-neutral-100 data-[state=active]:text-white data-[state=active]:bg-black">Preview</TabsTrigger>
                        </TabsList>

                        <TabsContent value="edit">
                            <div className="space-y-2">
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Write your post in markdown.."
                                    className="w-full min-h-[150px] border rounded-md px-3 py-2"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="preview">
                            <div className="space-y-2">
                                <div className="w-full prose min-h-[150px] border rounded-md px-3 py-2">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeSanitize]}
                                    >
                                        {content || "Nothing to Preview Yet"}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>


                    <h1 className="text-2xl font-semibold">
                        Relevant Interests
                    </h1>

                    <Input
                        value={query}
                        onChange={async (e) => {
                            const value = e.target.value;
                            setQuery(value);

                            if (!value) {
                                setSuggestions([]);
                                return;
                            }

                            const res = await fetch(`/api/interests?query=${value}`);
                            const data = await res.json();

                            setSuggestions(data);
                        }}

                        placeholder="Add relevant interests.."
                    />

                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 w-auto bg-white border rounded-md mt-1 shadow">
                            {suggestions.map((interest) => (
                                <li
                                    key={interest.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        if (!selectedInterests.find(i => i.id === interest.id)) {
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

                    <div className="flex flex-wrap gap-2">
                        {selectedInterests.map((interest) => (
                            <Button
                                key={interest.id}
                                type="button"
                                disabled={isPending}
                                className="w-full h-11 bg-black text-white inline-flex w-auto h-auto"
                                onClick={() => {
                                    setSelectedInterests(prev => prev.filter(i => i.id !== interest.interest.id));
                                }}
                            >
                                {interest.name}
                            </Button>
                        ))}
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-11 bg-green-500 text-white"
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