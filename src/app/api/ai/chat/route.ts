import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const data = body.data || body;

    // Ensure API key is set, else return a graceful error
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file."
      }, { status: 500 });
    }

    const { title, budget, format, tier, targetAudience, baseRequirements, allowFraction, brandName } = data || {};

    const systemPrompt = `You are an expert Influencer Marketing Campaign Manager AI for "Richy Reach".
Your goal is to take a brand's raw braindump and campaign details, and transform them into a professional, highly-polished campaign brief.

Here are the details provided by the brand "${brandName || 'Unknown'}":
- Original Title: ${title || "N/A"}
- Budget: $${budget || "N/A"}
- Content Format: ${format || "N/A"}
- Creator Tier: ${tier || "N/A"}
- Target Audience: ${targetAudience || "N/A"}
- Raw Requirements: ${baseRequirements || "N/A"}
- Allow Fractional/Multiple Creators: ${allowFraction ? "Yes" : "No"}

Instructions:
Generate a structured, professional campaign brief based on the provided details. Be creative and make the requirements sound appealing to creators, but do not invent restrictive constraints not implied by the prompt.`;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      schema: z.object({
        refinedTitle: z.string().describe("A catchy, polished version of the original campaign title."),
        description: z.string().describe("A compelling campaign overview and hook (2-3 sentences)."),
        targetAudience: z.string().describe("A polished description of the target demographic and psychographics."),
        requirements: z.string().describe("A detailed, professional list of deliverables, specific requirements, and brand guidelines."),
      }),
      prompt: "Generate the structured brief.",
      temperature: 0.7,
    });

    return NextResponse.json({ brief: result.object });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI response" }, { status: 500 });
  }
}
