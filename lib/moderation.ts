import OpenAI from "openai";

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export async function moderateContent(text: string, imageURLs: string[] = []) {
    console.log("Moderation request fired at", Date.now());
    
    try {
        const input: any[] = [{ type: "text", text }];
        
        imageURLs.forEach(url => {
            console.log("Moderate image");
            input.push({
                type: "image_url",
                image_url: { "url": url }
            });
        });

        const res = await client.moderations.create({
            model: "omni-moderation-latest",
            input: input
        });
    
        const result = res.results[0];

        console.log(result!);

        return {
            flagged: result.flagged,
            categories: result.categories,
            inputTypes: result.category_applied_input_types
        };
    }
    catch (err: any) {
        throw err;
    }
}