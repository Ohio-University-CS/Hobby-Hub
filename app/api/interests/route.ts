import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const interests = await prisma.interest.findMany({
        where: query ? {
            name: {
                contains: query,
                mode: "insensitive"
            }
        } : undefined,
        include: {
            _count: {
                select: {
                    posts: true
                }
            }
        },
        take: 10
    });

    return NextResponse.json(interests);
}