import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const interests = [
    "Reading",
    "Writing",
    "Drawing",
    "Painting",
    "Photography",
    "Music",
    "Singing",
    "Dancing",
    "Cooking",
    "Coding",
    "Baking",
    "Electronics",
    "Gardening",
    "Hiking",
    "Walking",
    "Running",
    "Cycling",
    "Swimming",
    "Traveling",
    "Fitness",
    "Yoga",
    "Meditation",
    "Watching Movies/TV",
    "Learning Languages",
    "Volunteering",
    "Journaling",
    "Crafting",
    "DIY Projects",
    "Bird Watching",
    "Fishing",
    "Camping",
    "Socializing",
    "Collecting",
    "Board Games",
    "Puzzles",
    "Sports",
    "Video Games"
];

async function main() {
    for(const name of interests) {
        await prisma.interest.upsert({
            where: {name},
            update: {},
            create: {name}
        });
    }
}

main().catch(console.error).finally(()=>prisma.$disconnect());