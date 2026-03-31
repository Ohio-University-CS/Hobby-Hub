'use client'

import { Card, CardContent } from "./ui/card";
import { getDayFromCreatedAt } from "@/lib/date-to-day";

export function PostCard({post, router, href}: {post: PostWithRelations; router: any; href: any}) {

    return (
        <Card
            key = {post.id}
            onClick = {() => router.push(href)}
            className = "bg-white cursor-pointer border border-neutral-200 rounded-lg shadow hover:shadow-2xl transition flex flex-col overflow-hidden aspect-[4/3]"
        >
            <CardContent className="flex-1 flex items-center justify-center text-center text-lg font-medium truncate">
                {post.title}
            </CardContent>
    
            <div className="border-t border-neutral-100 px-4 py-3 text-left">
                <div className="text-sm font-semibold text-neutral-800 truncate">
                    {post.title}
                </div>
                
                <div className="text-xs text-neutral-500 truncate">
                    {post.user?.name}
                </div>
    
                <div className="text-xs text-neutral-500 truncate">
                    {getDayFromCreatedAt(post.createdAt)}
                </div>
            </div>
        </Card>
    );
};