import { Context } from "hono";
import { CalculatorService } from "../services/calculator.service";
import { reachCalculatorSchema, earningsCalculatorSchema } from "../validators/calculator";
import { sendSuccess, sendError } from "../utils/response";

export class CalculatorController {
  static async getReach(c: Context) {
    try {
      const body = await c.req.json();
      const validation = reachCalculatorSchema.safeParse(body);
      
      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }
      
      const { budget, influencerTier, engagementRate } = validation.data;
      const result = CalculatorService.calculateReach(budget, influencerTier, engagementRate);
      
      return sendSuccess(c, result, "Reach metrics calculated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to calculate reach", 500);
    }
  }

  static async getEarnings(c: Context) {
    try {
      const body = await c.req.json();
      const validation = earningsCalculatorSchema.safeParse(body);
      
      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }
      
      const { followers, engagementRate, niche } = validation.data;
      const result = CalculatorService.calculateEarnings(followers, engagementRate, niche);
      
      return sendSuccess(c, result, "Earnings potential calculated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to calculate earnings", 500);
    }
  }
}
