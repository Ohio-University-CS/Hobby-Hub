import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, {params} : RouteContext) { 
    try {
        const { id } = await params;

        const updatedPost = await prisma.post.update({
            where: { id },
            data: {views: {increment: 1}},
        });

        return NextResponse.json({views: updatedPost.views});
    } catch (err) {
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}