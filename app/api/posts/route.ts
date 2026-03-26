import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const session = await auth.api.getSession({ headers: req.headers });

    if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});

    let body: {title?: string; content?: string} = {};
    try {
        body = await req.json();
    }
    catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }

    const {title, content} = body;

    if(!title || !content) return NextResponse.json({error: "Missing fields"}, {status: 400});
    
    const post = await prisma.post.create({
        data: {
            title,
            content,
            userId: session.user.id
        },
    });

    return NextResponse.json(post);
}