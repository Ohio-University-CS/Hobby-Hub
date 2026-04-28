import { auth } from "@/lib/auth";
import { moderateText } from "@/lib/moderation";
import { prisma } from "@/lib/prisma";
import { Route } from "next";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
    const { id } = await params;

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                hearts: {
                    select: { userId: true }
                },
                postInterests: {
                    include: {
                        interest: true
                    }
                },
                user: true
            }
        });

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

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
        console.error(err!);
        return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

        const { id } = await params;
        const { title, content, interests, media } = await req.json();

        if (!title) return NextResponse.json({ error: "Missing title." }, { status: 400 });
        if (!content) return NextResponse.json({ error: "Missing content." }, { status: 400 });
        if (!interests) return NextResponse.json({ error: "Missing interests." }, { status: 400 });

        const post = await prisma.post.findUnique({ where: { id: id } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 400 });

        if (post.userId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const moderation = await moderateText(content + " " + title);

        if (moderation.flagged) {
            return NextResponse.json(
                { error: "Content violates Hobby-Hub's Community Guidelines." },
                { status: 400 }
            );
        }

        const updatedPost = await prisma.post.update({
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
            where: {
                id: id
            },
            data: {
                title: title,
                content: content,
                media: media,
                postInterests: {
                    deleteMany: {},
                    create: interests.map((interestId: string) => ({
                        interest: {
                            connect: { id: interestId }
                        }
                    }))
                }
            }
        });

        const response: PostWithRelations = {
            id: updatedPost.id,
            title: updatedPost.title,
            content: updatedPost.content,
            createdAt: updatedPost.createdAt,
            user: updatedPost.user,
            media: updatedPost.media,
            interests: updatedPost.postInterests.map(pi => ({
                id: pi.interest.id,
                name: pi.interest.name
            })),
            views: updatedPost.views,
            hearts: updatedPost.hearts
        };

        return NextResponse.json(response);
    }

    catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

        const { id } = await params;

        const post = await prisma.post.findUnique({ where: { id: id } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 400 });

        if (post.userId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        await prisma.postInterest.deleteMany({
            where: { postId: id }
        });

        await prisma.post.delete({
            where: { id: id }
        });

        return NextResponse.json({ success: true });
    }

    catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}