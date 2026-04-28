import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

        const { id } = await params;

        const updatedPost = await prisma.$transaction(async (tx) => {
            const existingHeart = await tx.heart.findUnique({
                where: {
                    userId_postId: { userId: session.user.id, postId: id }
                }
            });

            // Unlike/like
            if (existingHeart) {
                await tx.heart.delete({ where: { id: existingHeart.id } });
            } else {
                await tx.heart.create({ data: { userId: session.user.id, postId: id } });
            }

            return await tx.post.findUnique({
                where: { id },
                include: {
                    user: true,
                    hearts: {
                        select: { userId: true }
                    },
                    postInterests: {
                        include: { interest: true }
                    }
                }
            });
        });

        if (!updatedPost) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const response: PostWithRelations = {
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content,
            createdAt: updatedPost.createdAt,
            user: updatedPost.user,
            media: updatedPost.media,
            views: updatedPost.views,
            interests: updatedPost.postInterests.map(pi => ({
                id: pi.interest.id,
                name: pi.interest.name
            })),
            hearts: updatedPost.hearts
        };

        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}