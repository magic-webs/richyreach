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

    const systemPrompt = `You are a campaign manager for "Richy Reach".
Write a simple and clear campaign brief using easy English words. Keep it short and do not use complex words.

Brand Name: ${brandName || 'Unknown'}
Title: ${title || "N/A"}
Budget: $${budget || "N/A"}
Format: ${format || "N/A"}
Tier: ${tier || "N/A"}
Audience: ${targetAudience || "N/A"}
Requirements: ${baseRequirements || "N/A"}
Allow Multiple Creators: ${allowFraction ? "Yes" : "No"}

Instructions:
Create a short, simple brief. Use basic words. Do not add extra rules.`;

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      schema: z.object({
        refinedTitle: z.string().describe("A short, clear campaign title."),
        description: z.string().describe("A short campaign summary (2-3 sentences)."),
        targetAudience: z.string().describe("Who the campaign is for."),
        requirements: z.string().describe("A simple list of what the creator must do."),
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
