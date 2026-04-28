import { auth } from "@/lib/auth";
import { moderateText } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const session = await auth.api.getSession({ headers: req.headers });

    if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});

    let body: {
        title?: string;
        content?: string;
        interests?: string[]
    } = {};

    try {
        body = await req.json();
    }
    catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }

    const {title, content, interests = []} = body;

    if(!title || !content || !interests) return NextResponse.json({error: "Missing fields"}, {status: 400});

    const moderation = await moderateText(content + " " + title);

    if(moderation.flagged) {
        return NextResponse.json(
            {error: "Content violates Hobby-Hub's Community Guidelines."},
            {status: 400}
        );
    }
    
    const post = await prisma.post.create({
        data: {
            title,
            content,
            userId: session.user.id,

            postInterests: {
                create: interests.map((interestId) => ({
                    interest: {
                        connect: {id: interestId}
                    }
                }))
            }
        },
    });

    return NextResponse.json(post);
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({headers: req.headers});
    
        if(!session?.user) {
            return NextResponse.json({error: "Not authorized"}, {status: 401});
        }

        const user = await prisma.user.findUnique({
            where: {id: session.user?.id},
            include: {userInterests: true}
        });
    
        const posts = await prisma.post.findMany({
            include: {
                user: true,
                postInterests: {
                    include: {
                        interest: true
                    }
                },
                hearts: {
                    select: {userId: true}
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