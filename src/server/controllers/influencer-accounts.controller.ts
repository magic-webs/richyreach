import { Context } from "hono";
import { HonoEnv } from "../types";
import { sendSuccess, sendError } from "../utils/response";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";

const NICHES = ["Fashion & Styling", "Tech & Gadgets", "Fitness & Health", "Travel & Adventure", "Food & Culinary", "Gaming", "Beauty & Cosmetics", "Lifestyle", "Finance", "Education"];

function deriveLevel(followers: number): "nano" | "micro" | "mid" | "macro" | "mega" {
  if (followers >= 1_000_000) return "mega";
  if (followers >= 100_000) return "macro";
  if (followers >= 50_000) return "mid";
  if (followers >= 10_000) return "micro";
  return "nano";
}

export class InfluencerAccountsController {
  // GET /influencers/accounts
  static async listAccounts(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const db = getDb(c.env);
      const accounts = await db
        .select()
        .from(schema.influencerAccounts)
        .where(eq(schema.influencerAccounts.userId, user.id))
        .all();

      return sendSuccess(c, accounts, "Influencer accounts retrieved");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch accounts", 500);
    }
  }

  // POST /influencers/accounts
  static async addAccount(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const { instagramHandle, followers = 0, engagementRate = 0, avgViews = 0, avgLikes = 0, niche = "Lifestyle", pricing = 0, country, bio } = body;

      if (!instagramHandle?.trim()) {
        return sendError(c, "Instagram handle is required", 400);
      }

      const db = getDb(c.env);

      // Check uniqueness
      const existing = await db
        .select()
        .from(schema.influencerAccounts)
        .where(eq(schema.influencerAccounts.instagramHandle, instagramHandle.trim().toLowerCase()))
        .get();

      if (existing) {
        return sendError(c, "This Instagram handle is already registered", 409);
      }

      const id = `iacc_${crypto.randomUUID()}`;
      const level = deriveLevel(followers);

      await db.insert(schema.influencerAccounts).values({
        id,
        userId: user.id,
        instagramHandle: instagramHandle.trim().toLowerCase(),
        followers: Number(followers) || 0,
        engagementRate: Number(engagementRate) || 0,
        avgViews: Number(avgViews) || 0,
        avgLikes: Number(avgLikes) || 0,
        niche: NICHES.includes(niche) ? niche : "Lifestyle",
        pricing: Math.round(Number(pricing) * 100) || 0,
        level,
        country: country || null,
        bio: bio || null,
        status: "pending",
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await db
        .select()
        .from(schema.influencerAccounts)
        .where(eq(schema.influencerAccounts.id, id))
        .get();

      return sendSuccess(c, created, "Instagram account submitted for verification", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to add account", 500);
    }
  }

  // PUT /influencers/accounts/:id
  static async updateAccount(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const accountId = c.req.param("id") || "";
      const db = getDb(c.env);

      const existing = await db
        .select()
        .from(schema.influencerAccounts)
        .where(and(eq(schema.influencerAccounts.id, accountId), eq(schema.influencerAccounts.userId, user.id)))
        .get();

      if (!existing) return sendError(c, "Account not found", 404);

      // Cannot edit a verified account's handle
      const body = await c.req.json();
      const { followers, engagementRate, avgViews, avgLikes, niche, pricing, country, bio } = body;

      const newFollowers = followers !== undefined ? Number(followers) : existing.followers;
      const level = deriveLevel(newFollowers);

      await db
        .update(schema.influencerAccounts)
        .set({
          followers: newFollowers,
          engagementRate: engagementRate !== undefined ? Number(engagementRate) : existing.engagementRate,
          avgViews: avgViews !== undefined ? Number(avgViews) : existing.avgViews,
          avgLikes: avgLikes !== undefined ? Number(avgLikes) : existing.avgLikes,
          niche: niche ? (NICHES.includes(niche) ? niche : existing.niche) : existing.niche,
          pricing: pricing !== undefined ? Math.round(Number(pricing) * 100) : existing.pricing,
          country: country !== undefined ? country : existing.country,
          bio: bio !== undefined ? bio : existing.bio,
          level,
          // Re-submit for verification if data changed
          status: existing.status === "verified" ? "verified" : "pending",
          updatedAt: new Date(),
        })
        .where(eq(schema.influencerAccounts.id, accountId));

      const updated = await db
        .select()
        .from(schema.influencerAccounts)
        .where(eq(schema.influencerAccounts.id, accountId))
        .get();

      return sendSuccess(c, updated, "Account updated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to update account", 500);
    }
  }

  // DELETE /influencers/accounts/:id
  static async deleteAccount(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const accountId = c.req.param("id") || "";
      const db = getDb(c.env);

      const existing = await db
        .select()
        .from(schema.influencerAccounts)
        .where(and(eq(schema.influencerAccounts.id, accountId), eq(schema.influencerAccounts.userId, user.id)))
        .get();

      if (!existing) return sendError(c, "Account not found", 404);

      await db
        .delete(schema.influencerAccounts)
        .where(eq(schema.influencerAccounts.id, accountId));

      return sendSuccess(c, null, "Account removed");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to delete account", 500);
    }
  }
}
