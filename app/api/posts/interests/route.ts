import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

        const interestIds = user?.userInterests.map(ui => ui.interestId) || [];
    
        const posts = await prisma.post.findMany({
            where: {
                postInterests: {
                    some: {
                        interestId: {
                            in: interestIds
                        }
                    }
                }
            },
            include: {
                postInterests: {
                    include: {
                        interest: true
                    }
                }
            },
            orderBy: {createdAt: "desc"}
        });

        return NextResponse.json(posts);
    }
    catch (err) {
        console.error(err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}