import { Context } from "hono";
import { BrandService } from "../services/brand.service";
import { brandProfileSchema, createCampaignSchema, inviteInfluencerSchema } from "../validators/brand";
import { sendSuccess, sendError } from "../utils/response";
import { HonoEnv } from "../types";

export class BrandController {
  static async createOrUpdateProfile(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const validation = brandProfileSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const profile = await BrandService.createOrUpdateProfile(c.env, user.id, validation.data);
      return sendSuccess(c, profile, "Brand profile updated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to save profile", 500);
    }
  }

  static async getProfile(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const profile = await BrandService.getBrandProfile(c.env, user.id);
      return sendSuccess(c, profile, "Brand profile retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch brand profile", 500);
    }
  }

  static async getDashboard(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const data = await BrandService.getDashboardData(c.env, user.id);
      return sendSuccess(c, data, "Dashboard data retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to load dashboard", 500);
    }
  }

  static async createCampaign(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const validation = createCampaignSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const campaign = await BrandService.createCampaign(c.env, user.id, validation.data);
      return sendSuccess(c, campaign, "Campaign created successfully", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to create campaign", 500);
    }
  }

  static async updateCampaign(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const id = c.req.param("id") || "";
      const body = await c.req.json();
      
      const campaign = await BrandService.updateCampaign(c.env, user.id, id, body);
      return sendSuccess(c, campaign, "Campaign updated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to update campaign", 500);
    }
  }

  static async deleteCampaign(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const id = c.req.param("id") || "";
      await BrandService.deleteCampaign(c.env, user.id, id);
      return sendSuccess(c, null, "Campaign deleted successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to delete campaign", 500);
    }
  }

  static async getCampaigns(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const campaigns = await BrandService.getCampaigns(c.env, user.id);
      return sendSuccess(c, campaigns, "Campaigns retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch campaigns", 500);
    }
  }

  static async getCampaignById(c: Context<HonoEnv>) {
    try {
      const id = c.req.param("id") || "";
      const result = await BrandService.getCampaignById(c.env, id);

      if (!result) {
        return sendError(c, "Campaign not found", 404);
      }

      return sendSuccess(c, result, "Campaign retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch campaign details", 500);
    }
  }

  static async inviteInfluencer(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const validation = inviteInfluencerSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const invite = await BrandService.inviteInfluencer(c.env, user.id, validation.data);
      return sendSuccess(c, invite, "Influencer invited successfully", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to invite influencer", 500);
    }
  }
}
