import OpenAI from "openai";

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function moderateText(text: string) {
    console.log("Moderation request fired at", Date.now());
    
    try {
        const res = await client.moderations.create({
            model: "omni-moderation-latest",
            input: text
        });
    
        const result = res.results[0];

        return {
            flagged: result.flagged,
            categories: result.categories
        };
    }
    catch (err: any) {
        throw err;
    }
}