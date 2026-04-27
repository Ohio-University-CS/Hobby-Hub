'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

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
    
    useEffect(() => {
        if(!postId) return;
        
        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${postId}`, {credentials: "include",});
                
                if(!res.ok) throw new Error("Failed to fetch post");
                
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
        
        if(postId) fetchPost();

        if (!api) return;

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });

    }, [postId, api]);

    if(loading) {
        return (
            <div className = "flex items-center justify-center ">
                <p className = "text-muted-foreground text-2xl font-semibold">Loading..</p>
            </div>
        );
    }

    if(!post) {
        return (
            <div className = "flex items-center justify-center">
                <p className = "text-muted-foreground text-2xl font-semibold">Post not found.</p>
            </div>
        );
    }

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
                                <CarouselPrevious className="left-5 h-10 w-10 border-none text-white mix-blend-difference"/>
                                <CarouselNext className="right-5 h-10 w-10 border-none text-white  mix-blend-difference"/>
                            </>
                        )}
                    </Carousel>

                    {post.media.length > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            {post.media.map((url: string, index: number ) => (
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

            <h1 className="text-3xl font-bold mb-6">
                {post.title}
            </h1>

            <h1 className="text-xl text-neutral-700 font-bold mb-2">
                {post.user?.name}
            </h1>

            <h1 className="text-xl text-neutral-700 font-bold mb-6">
                {getDayFromCreatedAt(post.createdAt)}
            </h1>

            <div className = "flex flex-wrap gap-2">
                {interests.map((interest) => (
                    <Button
                        key = {interest.id}
                        type = "button"
                        className = "w-full h-11 bg-black text-white inline-flex w-auto h-auto"
                    >
                        {interest.name}
                    </Button>
                ))}
            </div>

            <div className = "rounded-md p-4 bg-neutral-50">
                <div className = "prose max-w-none">
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