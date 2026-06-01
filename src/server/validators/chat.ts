import { z } from "zod";

export const createRoomSchema = z.object({
  influencerId: z.string().min(1, "Influencer ID is required"),
  campaignId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
});
