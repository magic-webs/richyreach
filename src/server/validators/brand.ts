import { z } from "zod";

export const brandProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  website: z.string().url("Invalid website URL"),
  logo: z.string().url("Invalid logo URL").optional().nullable(),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional().nullable(),
});

export const createCampaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  budget: z.number().int().positive("Budget must be a positive integer in cents"),
  campaignType: z.string().min(1, "Campaign type is required"), // e.g. "reel", "story", "post"
  targetAudience: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  expectedReach: z.number().int().nonnegative().optional(),
});

export const inviteInfluencerSchema = z.object({
  influencerId: z.string().min(1, "Influencer user ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
});
