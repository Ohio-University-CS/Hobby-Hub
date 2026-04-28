'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Heart, Eye } from "lucide-react"
import { getUserColor } from "@/lib/user-color";
import { authClient } from "@/lib/auth-client";

import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { sanitizeSchema } from "@/lib/sanitize-schema";

import { useRouter } from "next/navigation";
import { getDayFromCreatedAt } from "@/lib/date-to-day"

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "./ui/carousel";
import { cn } from "@/lib/utils";

export const ViewPostPage = () => {
    const params = useParams();
    const postId = params.id as string;

    const [post, setPost] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [interests, setInterests] = useState<any[]>([]);
    const router = useRouter();

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const { data: session } = authClient.useSession();

    const currentUserId = session?.user?.id;

    useEffect(() => {
        if (!postId) return;

        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${postId}`, { credentials: "include", });
                if (!res.ok) throw new Error("Failed to fetch post");

                const data = await res.json();

                setPost(data);
                setInterests(data.interests);
            }
            catch (err: any) {
                console.error(err);
                toast.error(err.message || "Error loading post");
            }
            finally {
                setLoading(false);
            }
        }

        async function triggerView() {
            const sessionKey = `viewed-${postId}`;
            if (!sessionStorage.getItem(sessionKey)) {
                try {
                    await fetch(`/api/posts/${postId}/view`, { method: "POST" });
                    sessionStorage.setItem(sessionKey, "true");
                } catch (e) {
                    console.error("View failed to track.");
                }
            }
        }

        fetchPost();
        triggerView();

        if (!api) return;

        setCurrent(api.selectedScrollSnap());
        api.on("select", () => { setCurrent(api.selectedScrollSnap()); });

    }, [postId, api]);

    const toggleHeart = async () => {
        if (!post) return;

        if (!currentUserId) {
            toast.error("You must be logged in to heart posts");
            return;
        }

        const isHearted = post.hearts.some((h: { userId: string }) => h.userId === currentUserId);

        const updatedHearts = isHearted
            ? post.hearts.filter((h: { userId: string }) => h.userId !== currentUserId)
            : [...post.hearts, { userId: currentUserId }];

        setPost({ ...post, hearts: updatedHearts });

        try {
            const res = await fetch(`/api/posts/${postId}/heart`, { method: "POST" });
            const data = await res.json();

            setPost(data);
        } catch (error) {
            toast.error("Could not heart.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center ">
                <p className="text-muted-foreground text-2xl font-semibold">Loading..</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-muted-foreground text-2xl font-semibold">Post not found.</p>
            </div>
        );
    }

    const isHeartedByMe = post.hearts.some((h: { userId: string }) => h.userId === currentUserId);
    const userColor = getUserColor(post.user?.id || "default");

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-6 bg-white rounded-2xl shadow shadow-2xl mt-4">
            <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                disabled={false}
                className="bg-black text-white"
            >
                Back
            </Button>

            {post.media.length > 0 && (
                <div className="">
                    <Carousel
                        setApi={setApi}
                        opts={{
                            loop: false,
                            align: "start"
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {post.media.map((url: string, index: number) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-[16/9] relative overflow-hidden rounded-xl border bg-black flex items-center justify-center">
                                        <Zoom>
                                            <img
                                                src={url}
                                                alt={`Post media ${index + 1}`}
                                                className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform hover:scale-[1.02]"
                                            />
                                        </Zoom>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {post.media.length > 1 && (
                            <>
                                <CarouselPrevious className="left-5 h-10 w-10 border-none text-white mix-blend-difference" />
                                <CarouselNext className="right-5 h-10 w-10 border-none text-white  mix-blend-difference" />
                            </>
                        )}
                    </Carousel>

                    {post.media.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            {post.media.map((url: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => api?.scrollTo(index)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        current === index ? "bg-black w-6" : "bg-neutral-300 w-2 hover:bg-neutral-400"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-start border-b pb-6">
                {/* Left side */}
                <div className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-full overflow-hidden">
                        {post.user?.image ? (
                            <div>
                                <img src={post.user.image} alt={`Profile picture of {post.user.name}`} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div
                                style={{ backgroundColor: userColor }}
                                className="w-full h-full flex items-center justify-center text-neutral-800 font-bold">
                                {post.user?.name?.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-between py-1">
                        <h1 className="text-3xl font-bold leading-tight">
                            {post.title}
                        </h1>

                        <h1 className="text-lg text-neutral-800 font-semibold">
                            {post.user?.name}
                        </h1>

                        <h1 className="text-sm text-neutral-500">
                            {getDayFromCreatedAt(post.createdAt)}
                        </h1>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end gap-6 pt-2">

                    <div className="flex flex-row items-center gap-1 text-neutral-800">
                        {/* Views Row */}
                        <div className="flex flex-row items-center gap-1 text-neutral-800">
                            <Eye className="w-5 h-5" />
                            <span className="text-lg font-semibold">{post.views}</span>
                        </div>

                        {/* Hearts */}
                        <button
                            onClick={toggleHeart}
                            className="flex flex-col items-center gap-1 group transition-all active:scale-95"
                        >
                            <div className="flex items-center gap-1">
                                <Heart className={cn(
                                    "w-5 h-5 transition-colors",
                                    isHeartedByMe ? "fill-red-500 stroke-red-500" : "group-hover:stroke-red-400"
                                )} />
                                <span className={cn("text-xl font-bold leading-none", isHeartedByMe ? "text-red-500" : "text-neutral-800")}>
                                    {post.hearts.length}
                                </span>
                            </div>
                        </button>

                    </div>

                    {/* Interests Row */}
                    <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                            <Button
                                key={interest.id}
                                type="button"
                                className="w-full h-11 bg-black text-white inline-flex w-auto h-auto"
                            >
                                {interest.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>


            <div className="rounded-md p-4 bg-neutral-50">
                <div className="prose max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[[rehypeSanitize, sanitizeSchema] as const]}
                    >
                        {post.content || "Nothing to Preview Yet"}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};