import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params} : {params: {id: string}}) {

    const session = await auth.api.getSession({headers: req.headers});

    if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});

    const post = await prisma.post.findUnique({where: {id: params.id}});
    if(!post) return NextResponse.json({error: "Post not found"}, {status: 404});

    return NextResponse.json(post);
}

export async function PUT(req: NextRequest, {params} : {params: {id: string}}) {

    const session = await auth.api.getSession({headers: req.headers});

    if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});

    const {title, content} = await req.json();

    if(!title || !content) return NextResponse.json({error: "Missing title or content"}, {status: 400});

    const post = await prisma.post.findUnique({where: {id: params.id}});
    if(!post) return NextResponse.json({error: "Post not found"}, {status: 400});

    if (post.userId !== session.user.id) return NextResponse.json({error: "Unauthorized"}, {status: 403});

    const updatedPost = await prisma.post.update({
        where: {id: params.id},
        data: {title, content}
    });

    return NextResponse.json(updatedPost);
}