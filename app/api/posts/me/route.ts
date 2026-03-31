import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({headers: req.headers});

    if(!session?.user) {
        return NextResponse.json({error: "Not authorized"}, {status: 401});
    }

    const posts = await prisma.post.findMany({
        where: {userId: session.user.id},
        include: {
            user: true,
            postInterests: {
                include: {
                    interest: true
                }
            }
        },
        orderBy: {createdAt: "desc"},
    });

    const response: PostWithRelations[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        user: post.user,
        interests: post.postInterests.map(pi => ({
            id: pi.interest.id,
            name: pi.interest.name
        }))
    }));

    return NextResponse.json(response);
}