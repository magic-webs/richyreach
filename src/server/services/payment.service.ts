import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";

export class PaymentService {
  static async createPaymentSession(
    env: Record<string, any>,
    brandId: string,
    campaignId: string,
    amount: number
  ) {
    const db = getDb(env);

    // Verify campaign exists
    const campaign = await db
      .select()
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.id, campaignId), eq(schema.campaigns.brandId, brandId)))
      .get();

    if (!campaign) {
      throw new Error("Campaign not found or not owned by this brand");
    }

    // Ensure Stripe is configured before creating a session
    const stripeKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("Stripe credentials missing in environment variables.");
    }
    
    throw new Error("Stripe integration not implemented yet. Cannot create real payment session.");
  }

  static async handleWebhook(env: Record<string, any>, payload: any) {
    const db = getDb(env);
    const eventType = payload.type;
    const object = payload.data?.object;

    if (eventType === "payment_intent.succeeded" || eventType === "checkout.session.completed") {
      const sessionId = object.id || object.payment_intent;
      
      if (!sessionId) {
        throw new Error("Invalid session identifier in payload");
      }

      // Find the pending payment
      const payment = await db
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.stripePaymentIntentId, sessionId))
        .get();

      if (!payment) {
        throw new Error("Payment record not found for webhook session");
      }

      // Update payment status
      await db
        .update(schema.payments)
        .set({ status: "succeeded" })
        .where(eq(schema.payments.id, payment.id));

      // Find campaign details
      const campaign = await db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, payment.campaignId))
        .get();

      if (campaign) {
        // Update campaign status
        await db
          .update(schema.campaigns)
          .set({ status: "active" }) // Set active once paid/funded
          .where(eq(schema.campaigns.id, campaign.id));

        // Distribute earnings mock if influencer is accepted
        const acceptedApp = await db
          .select()
          .from(schema.campaignApplications)
          .where(and(eq(schema.campaignApplications.campaignId, campaign.id), eq(schema.campaignApplications.status, "accepted")))
          .get();

        if (acceptedApp) {
          // Distribute earnings to influencer
          await db.insert(schema.earnings).values({
            id: crypto.randomUUID(),
            influencerId: acceptedApp.influencerId,
            amount: payment.amount,
            source: campaign.id,
            status: "pending", // Cleared later
            createdAt: new Date(),
          });

          // Notify influencer
          await db.insert(schema.notifications).values({
            id: crypto.randomUUID(),
            userId: acceptedApp.influencerId,
            title: "Funds Deposited in Escrow",
            message: `Brand funded campaign "${campaign.title}". Your earnings are pending campaign completion.`,
            read: false,
            createdAt: new Date(),
          });
        }

        // Notify brand
        await db.insert(schema.notifications).values({
          id: crypto.randomUUID(),
          userId: campaign.brandId,
          title: "Payment Succeeded",
          message: `Your payment for campaign "${campaign.title}" has cleared successfully.`,
          read: false,
          createdAt: new Date(),
        });
      }

      return { success: true, processed: true };
    }

    return { success: true, processed: false };
  }
}
