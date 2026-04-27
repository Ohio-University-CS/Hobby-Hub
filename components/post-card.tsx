'use client'

import { Card, CardContent } from "./ui/card";
import { getDayFromCreatedAt } from "@/lib/date-to-day";

import { getUserColor } from "@/lib/user-color";

export function PostCard({post, router, href}: {post: PostWithRelations; router: any; href: any}) {

    const userColor = getUserColor(post.user?.id || "default");

    return (
        <Card
            key = {post.id}
            onClick = {() => router.push(href)}
            className = "bg-white border-neutral-900 cursor-pointer border border-neutral-200 rounded-lg shadow hover:shadow-xl transition flex flex-col overflow-hidden aspect-[4/3]"
        >
            <CardContent className="text-neutral-800 flex-1 flex items-center justify-center text-center text-lg font-medium truncate">
                {post.title}
            </CardContent>
    
            <div className="p-4 pt-6 relative">
                <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        {post.user?.image ? (
                            <div>
                                <img src={post.user.image} alt={`Profile picture of {post.user.name}`} className="w-full h-full object-cover"/>
                            </div>
                        ) : (
                            <div 
                            style={{backgroundColor: userColor}}
                            className="w-full h-full flex items-center justify-center text-neutral-800 font-bold">
                                {post.user?.name?.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="text-neutral-800 text-sm font-bold truncate">
                            {post.title}
                        </div>

                        <div className="text-neutral-800 text-xs truncate">
                            {post.user?.name}
                        </div>

                        <h1 className="text-xs text-neutral-400 mb-6">
                            {getDayFromCreatedAt(post.createdAt)}
                        </h1>
                    </div>
                </div>
            </div>
        </Card>
    );
};