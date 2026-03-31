import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({headers: req.headers});

        // User doesn't need to be valid here. Let users explore without creating an account.
    
        const posts = await prisma.post.findMany({
            include: {user: true},
            orderBy: {createdAt: "desc"}
        });

        return NextResponse.json(posts);
    }
    catch (err) {
        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}