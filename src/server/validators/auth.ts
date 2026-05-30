import { z } from "zod";

export const requestOtpSchema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
  method: z.enum(["email", "whatsapp"]),
  mode: z.enum(["login", "signup"]).optional(),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
  role: z.enum(["influencer", "brand", "admin"]).optional(),
  name: z.string().optional(),
});
