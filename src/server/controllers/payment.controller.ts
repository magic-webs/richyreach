import { Context } from "hono";
import { PaymentService } from "../services/payment.service";
import { createPaymentSchema, stripeWebhookSchema } from "../validators/payment";
import { sendSuccess, sendError } from "../utils/response";
import { HonoEnv } from "../types";

export class PaymentController {
  static async createCheckoutSession(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const validation = createPaymentSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const result = await PaymentService.createPaymentSession(
        c.env,
        user.id,
        validation.data.campaignId,
        validation.data.amount
      );

      return sendSuccess(c, result, "Checkout session created successfully", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to create checkout session", 500);
    }
  }

  static async handleWebhook(c: Context<HonoEnv>) {
    try {
      const body = await c.req.json();
      const validation = stripeWebhookSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const result = await PaymentService.handleWebhook(c.env, validation.data);
      return sendSuccess(c, result, "Webhook processed successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Webhook processing error", 500);
    }
  }
}
