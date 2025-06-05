import openai from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

const SystemPrompt = `You are a professional image analyst with a keen eye for detail and expertise in summarizing visual content. Your specialty lies in creating concise, impactful titles that capture the essence of an image in just a few words, focusing on the main character and the overall theme.
Your task is to provide a short title for any image prompt given to you. When a user shares an image prompt, ensure the title is no longer than 2-3 words and reflects the main character prominently.
Keep in mind that the title should be professional, engaging, and immediately convey the main subject of the image. 
Example of how you would do it: 

Image Prompt: A heroic knight standing in a lush forest.
Title: "Knight in Forest"

`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-r1-distill-qwen-14b:free",
            messages: [
                {
                    role: "system",
                    content: SystemPrompt,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        return NextResponse.json(
            {
                success: true,
                message: "Title generated successfull",
                title: completion.choices[0].message,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Generate title API error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
