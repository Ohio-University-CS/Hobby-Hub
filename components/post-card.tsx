'use client'

import { Card, CardContent } from "./ui/card";
import { getDayFromCreatedAt } from "@/lib/date-to-day";

import { getUserColor } from "@/lib/user-color";

export function PostCard({ post, router, href }: { post: PostWithRelations; router: any; href: any }) {

    const userColor = getUserColor(post.user?.id || "default");

    return (
        <Card
            key={post.id}
            onClick={() => router.push(href)}
            className="p-0 bg-white cursor-pointer border border-neutral-200 rounded-lg shadow hover:shadow-xl transition flex flex-col overflow-hidden"
        >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                {post.media && post.media.length > 0 ? (
                    <img
                        src={post.media[0]}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-center text-white text-lg font-medium px-4">
                        {post.title}
                    </div>
                )}
            </div>

            <div className="p-3 flex items-start space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                    {post.user?.image ? (
                        <div>
                            <img src={post.user.image} alt={`Profile picture of {post.user.name}`} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div
                            style={{ backgroundColor: userColor }}
                            className="w-full h-full flex items-center justify-center text-neutral-800 font-bold"
                        >
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

                    <h1 className="text-xs text-neutral-600 mb-6">
                        {getDayFromCreatedAt(post.createdAt)}
                    </h1>
                </div>
            </div>
        </Card>
    );
};