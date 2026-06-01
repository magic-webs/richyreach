import { Context } from "hono";
import { InfluencerService } from "../services/influencer.service";
import { influencerProfileSchema, applyCampaignSchema } from "../validators/influencer";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { HonoEnv } from "../types";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { fetchInstagramProfile } from "../utils/instagram-api";

export class InfluencerController {
  static async getInfluencers(c: Context<HonoEnv>) {
    try {
      const q = c.req.query();
      const niche = q.niche;
      const level = q.level as any;
      const minFollowers = q.minFollowers ? parseInt(q.minFollowers, 10) : undefined;
      const maxPricing = q.maxPricing ? parseInt(q.maxPricing, 10) : undefined;
      const search = q.search;
      const limit = q.limit ? parseInt(q.limit, 10) : 10;
      const offset = q.offset ? parseInt(q.offset, 10) : 0;

      const result = await InfluencerService.getInfluencers(c.env, {
        niche,
        level,
        minFollowers,
        maxPricing,
        search,
        limit,
        offset,
      });

      return sendPaginated(c, result.items, {
        total: result.total,
        limit,
        offset,
        hasMore: offset + limit < result.total,
      }, "Influencers fetched successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch influencers", 500);
    }
  }

  static async getInfluencerById(c: Context<HonoEnv>) {
    try {
      const id = c.req.param("id") || "";
      const profile = await InfluencerService.getInfluencerById(c.env, id);

      if (!profile) {
        return sendError(c, "Influencer profile not found", 404);
      }

      return sendSuccess(c, profile, "Influencer profile retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch influencer", 500);
    }
  }

  static async createOrUpdateProfile(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const validation = influencerProfileSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const profile = await InfluencerService.createOrUpdateProfile(c.env, user.id, validation.data);
      return sendSuccess(c, profile, "Influencer profile updated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to save profile", 500);
    }
  }

  static async getDashboard(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const data = await InfluencerService.getDashboardData(c.env, user.id);
      return sendSuccess(c, data, "Dashboard data retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to load dashboard", 500);
    }
  }

  static async getCampaigns(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const data = await InfluencerService.getCampaigns(c.env, user.id);
      return sendSuccess(c, data, "Campaigns retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to load campaigns", 500);
    }
  }

  static async applyCampaign(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const campaignId = c.req.param("campaignId") || "";
      const body = await c.req.json();
      const validation = applyCampaignSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const application = await InfluencerService.applyToCampaign(
        c.env,
        user.id,
        campaignId,
        validation.data.proposal,
        validation.data.influencerAccountId
      );

      return sendSuccess(c, application, "Successfully applied to campaign", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to apply to campaign", 500);
    }
  }

  static async getEarnings(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const data = await InfluencerService.getEarnings(c.env, user.id);
      return sendSuccess(c, data, "Earnings records retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to load earnings", 500);
    }
  }

  static async getAnalytics(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const data = await InfluencerService.getAnalytics(c.env, user.id);
      return sendSuccess(c, data, "Analytics records retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to load analytics", 500);
    }
  }

  static async getMarketplaceCampaigns(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const q = c.req.query();
      const campaigns = await InfluencerService.getMarketplaceCampaigns(c.env, user.id, {
        category: q.category,
        campaignType: q.campaignType,
        search: q.search,
        limit: q.limit ? parseInt(q.limit, 10) : 20,
        offset: q.offset ? parseInt(q.offset, 10) : 0,
      });
      return sendSuccess(c, campaigns, "Marketplace campaigns fetched");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch campaigns", 500);
    }
  }

  static async saveCampaign(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);
      const body = await c.req.json();
      const result = await InfluencerService.saveCampaign(c.env, user.id, body.campaignId);
      return sendSuccess(c, result, "Campaign saved");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to save campaign", 500);
    }
  }

  static async unsaveCampaign(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);
      const campaignId = c.req.param("campaignId") || "";
      const result = await InfluencerService.unsaveCampaign(c.env, user.id, campaignId);
      return sendSuccess(c, result, "Campaign unsaved");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to unsave campaign", 500);
    }
  }

  static async getSavedCampaigns(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);
      const data = await InfluencerService.getSavedCampaigns(c.env, user.id);
      return sendSuccess(c, data, "Saved campaigns retrieved");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch saved campaigns", 500);
    }
  }

  static async syncInstagram(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const db = getDb(c.env);
      const account = await db
        .select()
        .from(schema.accounts)
        .where(
          and(
            eq(schema.accounts.userId, user.id),
            eq(schema.accounts.providerId, "instagram")
          )
        )
        .get();

      if (!account || !account.accessToken) {
        return sendError(c, "Instagram account not connected", 400);
      }

      // Fetch from API
      const profileData = await fetchInstagramProfile(account.accountId, account.accessToken);

      // Update InfluencerProfile
      const existingProfile = await db
        .select()
        .from(schema.influencerProfiles)
        .where(eq(schema.influencerProfiles.userId, user.id))
        .get();

      const updateData = {
        instagramHandle: profileData.instagramHandle,
        followers: profileData.followers,
        engagementRate: profileData.engagementRate,
        niche: profileData.niche,
        avgViews: profileData.avgViews,
        level: profileData.level,
      };

      if (!existingProfile) {
        await db.insert(schema.influencerProfiles).values({
          userId: user.id,
          ...updateData,
          pricing: 0,
          verified: false,
        });
      } else {
        await db
          .update(schema.influencerProfiles)
          .set(updateData)
          .where(eq(schema.influencerProfiles.userId, user.id));
      }

      // Return updated profile
      const updated = await InfluencerService.getInfluencerById(c.env, user.id);
      return sendSuccess(c, updated, "Instagram profile synced successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to sync Instagram profile", 500);
    }
  }
}

