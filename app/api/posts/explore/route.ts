import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({headers: req.headers});

        // User doesn't need to be valid here. Let users explore without creating an account.
    
        const posts = await prisma.post.findMany({
            include: {
                hearts: {
                    select: {userId: true}
                },
                user: true,
                postInterests: {
                    include: {
                        interest: true
                    }
                }
            },
            orderBy: {createdAt: "desc"}
        });

        const response: PostWithRelations[] = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            user: post.user,
            media: post.media,
            interests: post.postInterests.map(pi => ({
                id: pi.interest.id,
                name: pi.interest.name
            })),
            views: post.views,
            hearts: post.hearts
        }));

        return NextResponse.json(response);
    }
    catch (err) {
        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}