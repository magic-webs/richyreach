import { z } from "zod";

export const reachCalculatorSchema = z.object({
  budget: z.number().positive("Budget must be greater than zero"), // in USD dollars
  influencerTier: z.enum(["nano", "micro", "mid", "macro", "mega", "any"]).default("any"),
  engagementRate: z.number().nonnegative("Engagement rate must be positive").optional(), // e.g. 3.5 for 3.5%
});

export const earningsCalculatorSchema = z.object({
  followers: z.number().int().positive("Follower count must be greater than zero"),
  engagementRate: z.number().nonnegative("Engagement rate must be positive"), // e.g. 3.5 for 3.5%
  niche: z.string().min(1, "Niche is required"),
});
