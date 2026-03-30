import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});

        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: {
                userInterests: {
                    include: {
                        interest: true
                    }
                }
            }
        });

        if(!user) return NextResponse.json({error: "User not found"}, {status: 404});
        
        const interests = user.userInterests.map(i => i.interest);

        return NextResponse.json({
            id: user.id,
            name: user.name,
            body: user.body,
            interests
        });
    }
    catch(err) {
        return NextResponse.json({error: "Failed to fetch user."}, {status: 500});
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});

        const userId = session.user.id;

        const {name, body, interests} = await req.json();
        
        if(interests.length !== 0) {
            await prisma.user.update({
                where: {id: userId},
                data: {
                    name: name,
                    body: body,
                    userInterests: {
                        deleteMany: {},
                        create: interests.map((interestId: string) => ({
                            interestId
                        }))
                    }
                }
            });
        }
        else {
            await prisma.user.update({
                where: {id: userId},
                data: {
                    userInterests: {
                        deleteMany: {},
                    }
                }
            });
        }

        return NextResponse.json({success: true});
    }

    catch(err) {
        return NextResponse.json({error: "Failed to update user."}, {status: 500});
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        
        if(!session?.user) return NextResponse.json({error: "Not authorized"}, {status: 401});

        const userId = session.user.id;

        await prisma.user.delete({
            where: {id: userId}
        });

        return NextResponse.json({success: true});
    }

    catch(err) {
        return NextResponse.json({error: "Failed to delete user"}, {status: 500});
    }
}