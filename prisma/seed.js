import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const interests = [
        "react",
        "nextjs",
        "typescript",
        "javascript",
        "nodejs",
        "docker",
        "ai",
        "design",
        "web",
        "webdev",
        "game-dev",
        "game-development",
    ];

    for(const name of interests) {
        await prisma.interest.upsert({
            where: {name},
            update: {},
            create: {name}
        });
    }
}

main().catch(console.error).finally(()=>prisma.$disconnect());