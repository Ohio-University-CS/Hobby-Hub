import { auth } from "@/lib/auth";
import { moderateContent } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

        const { title, content, interests, media } = await req.json();

        if (!title) return NextResponse.json({ error: "Missing title." }, { status: 400 });
        if (!content) return NextResponse.json({ error: "Missing content." }, { status: 400 });
        if (!interests) return NextResponse.json({ error: "Missing interests." }, { status: 400 });

        const moderation = await moderateContent(content + " " + title, []);

        if (moderation.flagged) {
            return NextResponse.json(
                { error: "Content violates Hobby-Hub's Community Guidelines." },
                { status: 400 }
            );
        }

        const post = await prisma.post.create({
            include: {
                user: true,
                hearts: {
                    select: { userId: true }
                },
                postInterests: {
                    include: {
                        interest: true
                    }
                }
            },
            data: {
                title,
                content,
                userId: session.user.id,
                media,
                postInterests: {
                    create: interests.map((interestId: number) => ({
                        interest: {
                            connect: { id: interestId }
                        }
                    }))
                }
            },
        });

        const response: PostWithRelations = {
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
        };

        return NextResponse.json(response);
    }

    catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const posts = await prisma.post.findMany({
            include: {
                user: true,
                postInterests: {
                    include: {
                        interest: true
                    }
                },
                hearts: {
                    select: { userId: true }
                }
            },
            orderBy: { createdAt: "desc" }
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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}