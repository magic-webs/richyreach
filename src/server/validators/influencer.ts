import { z } from "zod";

export const influencerProfileSchema = z.object({
  instagramHandle: z.string().min(1, "Instagram handle is required"),
  followers: z.number().int().nonnegative().optional(),
  engagementRate: z.number().nonnegative().optional(),
  niche: z.string().min(1, "Niche is required"),
  avgViews: z.number().int().nonnegative().optional(),
  pricing: z.number().int().nonnegative("Pricing must be positive (in cents)"),
  skills: z.array(z.string()).optional(),
  country: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  portfolioItems: z.array(
    z.object({
      mediaUrl: z.string().url("Invalid media URL"),
      mediaType: z.enum(["image", "video"]),
      title: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional(),
});


export const applyCampaignSchema = z.object({
  proposal: z.string().min(10, "Proposal must be at least 10 characters"),
  influencerAccountId: z.string().optional(),
});
