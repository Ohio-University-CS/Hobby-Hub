import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Route } from "next";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, {params} : RouteContext) {
    const { id } = await params;

    try {
        const post = await prisma.post.findUnique({where: {id}});
        if(!post) return NextResponse.json({error: "Post not found"}, {status: 404});

        return NextResponse.json(post);
    }
    catch (err) {
        return NextResponse.json({error: "Failed to load post"}, {status: 500});
    }
}

export async function PUT(req: NextRequest, {params} : RouteContext) {
    try {
        const session = await auth.api.getSession({headers: req.headers});
        
        if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});
        
        const { id } = await params;
        const {title, content} = await req.json();
    
        if(!title || !content) return NextResponse.json({error: "Missing title or content"}, {status: 400});
    
        const post = await prisma.post.findUnique({where: {id: id}});
        if(!post) return NextResponse.json({error: "Post not found"}, {status: 400});
    
        if (post.userId !== session.user.id) return NextResponse.json({error: "Unauthorized"}, {status: 403});
    
        const updatedPost = await prisma.post.update({
            where: {id: id},
            data: {title, content}
        });
    
        return NextResponse.json(updatedPost);
    }

    catch (err) {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}

export async function DELETE(req: NextRequest, {params}: RouteContext) {
    try {
        const session = await auth.api.getSession({headers: req.headers});
        
        if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});
        
        const { id } = await params;
        
        const post = await prisma.post.findUnique({where: {id: id}});
        if(!post) return NextResponse.json({error: "Post not found"}, {status: 400});
    
        if (post.userId !== session.user.id) return NextResponse.json({error: "Unauthorized"}, {status: 403});
    
        await prisma.post.delete({
            where: {id: id}
        });

        return NextResponse.json({success: true});
    }

    catch (err) {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}