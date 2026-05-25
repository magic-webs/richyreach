import { z } from "zod";

export const createPaymentSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  amount: z.number().int().positive("Amount must be a positive integer in cents"),
});

export const stripeWebhookSchema = z.object({
  type: z.string().min(1, "Event type is required"),
  data: z.object({
    object: z.record(z.string(), z.any()),
  }),
});
