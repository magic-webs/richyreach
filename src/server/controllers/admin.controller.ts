import { Context } from "hono";
import { AdminService } from "../services/admin.service";
import { sendSuccess, sendError } from "../utils/response";
import { HonoEnv } from "../types";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { eq, or } from "drizzle-orm";

export class AdminController {
  static async getUsers(c: Context<HonoEnv>) {
    try {
      const users = await AdminService.getUsers(c.env);
      return sendSuccess(c, users, "Users list retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to retrieve users", 500);
    }
  }

  static async getCampaigns(c: Context<HonoEnv>) {
    try {
      const campaigns = await AdminService.getCampaigns(c.env);
      return sendSuccess(c, campaigns, "Campaigns list retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to retrieve campaigns", 500);
    }
  }

  static async getReports(c: Context<HonoEnv>) {
    try {
      const stats = await AdminService.getReports(c.env);
      return sendSuccess(c, stats, "Platform analytics report retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to compile reports", 500);
    }
  }

  static async deleteUser(c: Context<HonoEnv>) {
    try {
      const id = c.req.param("id") || "";
      await AdminService.deleteUser(c.env, id);
      return sendSuccess(c, null, "User account and all dependencies deleted successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to delete user", 500);
    }
  }

  // GET /admin/pending-profiles — Returns all sub-accounts pending verification
  static async getPendingProfiles(c: Context<HonoEnv>) {
    try {
      const db = getDb(c.env);
      const q = c.req.query();
      const status = (q.status as "pending" | "verified" | "rejected") || "pending";

      const influencerAccounts = await db
        .select({
          account: schema.influencerAccounts,
          user: {
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          },
        })
        .from(schema.influencerAccounts)
        .leftJoin(schema.users, eq(schema.influencerAccounts.userId, schema.users.id))
        .where(eq(schema.influencerAccounts.status, status))
        .all();
        
      // Fetch services for these influencers
      const userIds = influencerAccounts.map(a => a.user?.id).filter(Boolean) as string[];
      const services = userIds.length > 0 
        ? await db.select().from(schema.creatorServices).where(or(...userIds.map(id => eq(schema.creatorServices.influencerId, id)))).all()
        : [];
        
      const servicesByUserId = services.reduce((acc, s) => {
        if (!acc[s.influencerId]) acc[s.influencerId] = [];
        acc[s.influencerId].push(s);
        return acc;
      }, {} as Record<string, any[]>);

      const brandAccounts = await db
        .select({
          account: schema.brandAccounts,
          user: {
            id: schema.users.id,
            name: schema.users.name,
            email: schema.users.email,
          },
        })
        .from(schema.brandAccounts)
        .leftJoin(schema.users, eq(schema.brandAccounts.userId, schema.users.id))
        .where(eq(schema.brandAccounts.status, status))
        .all();

      return sendSuccess(c, {
        influencerAccounts: influencerAccounts.map(r => ({ 
          ...r.account, 
          ownerName: r.user?.name, 
          ownerEmail: r.user?.email,
          services: r.user?.id ? servicesByUserId[r.user.id] || [] : []
        })),
        brandAccounts: brandAccounts.map(r => ({ ...r.account, ownerName: r.user?.name, ownerEmail: r.user?.email })),
        counts: {
          influencer: influencerAccounts.length,
          brand: brandAccounts.length,
          total: influencerAccounts.length + brandAccounts.length,
        }
      }, `${status} profiles retrieved`);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch pending profiles", 500);
    }
  }

  // GET /admin/profile/:type/:id — Returns a specific profile
  static async getProfile(c: Context<HonoEnv>) {
    try {
      const db = getDb(c.env);
      const type = c.req.param("type");
      const id = c.req.param("id");

      if (type === "influencer") {
        const account = await db
          .select({
            account: schema.influencerAccounts,
            user: {
              name: schema.users.name,
              email: schema.users.email,
            },
          })
          .from(schema.influencerAccounts)
          .leftJoin(schema.users, eq(schema.influencerAccounts.userId, schema.users.id))
          .where(eq(schema.influencerAccounts.id, id))
          .get();

        if (!account) return sendError(c, "Account not found", 404);

        // Fetch services
        const services = account.account.userId
          ? await db.select().from(schema.creatorServices).where(eq(schema.creatorServices.influencerId, account.account.userId)).all()
          : [];

        return sendSuccess(c, {
          ...account.account,
          ownerName: account.user?.name,
          ownerEmail: account.user?.email,
          services,
        }, "Profile retrieved");
      } else if (type === "brand") {
        const account = await db
          .select({
            account: schema.brandAccounts,
            user: {
              name: schema.users.name,
              email: schema.users.email,
            },
          })
          .from(schema.brandAccounts)
          .leftJoin(schema.users, eq(schema.brandAccounts.userId, schema.users.id))
          .where(eq(schema.brandAccounts.id, id))
          .get();

        if (!account) return sendError(c, "Account not found", 404);

        return sendSuccess(c, {
          ...account.account,
          ownerName: account.user?.name,
          ownerEmail: account.user?.email,
        }, "Profile retrieved");
      } else {
        return sendError(c, "Invalid account type", 400);
      }
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch profile", 500);
    }
  }

  // POST /admin/verify-profile — Approve or reject a sub-account
  static async verifyProfile(c: Context<HonoEnv>) {
    try {
      const admin = c.get("user");
      if (!admin) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const { accountId, accountType, action, note } = body;

      if (!accountId || !accountType || !action) {
        return sendError(c, "accountId, accountType, and action are required", 400);
      }
      if (!["influencer", "brand"].includes(accountType)) {
        return sendError(c, "accountType must be 'influencer' or 'brand'", 400);
      }
      if (!["approve", "reject"].includes(action)) {
        return sendError(c, "action must be 'approve' or 'reject'", 400);
      }

      const db = getDb(c.env);
      const newStatus = action === "approve" ? "verified" : "rejected";
      const now = new Date();

      if (accountType === "influencer") {
        const existing = await db
          .select()
          .from(schema.influencerAccounts)
          .where(eq(schema.influencerAccounts.id, accountId))
          .get();

        if (!existing) return sendError(c, "Influencer account not found", 404);

        await db
          .update(schema.influencerAccounts)
          .set({
            status: newStatus,
            verified: action === "approve",
            verifiedAt: now,
            verifiedBy: admin.id,
            verificationNote: note || null,
            updatedAt: now,
          })
          .where(eq(schema.influencerAccounts.id, accountId));
      } else {
        const existing = await db
          .select()
          .from(schema.brandAccounts)
          .where(eq(schema.brandAccounts.id, accountId))
          .get();

        if (!existing) return sendError(c, "Brand account not found", 404);

        await db
          .update(schema.brandAccounts)
          .set({
            status: newStatus,
            verified: action === "approve",
            verifiedAt: now,
            verifiedBy: admin.id,
            verificationNote: note || null,
            updatedAt: now,
          })
          .where(eq(schema.brandAccounts.id, accountId));
      }

      return sendSuccess(c, { accountId, accountType, newStatus }, `Profile ${action === "approve" ? "approved" : "rejected"} successfully`);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to verify profile", 500);
    }
  }

  // POST /admin/update-profile — Update an account profile
  static async updateProfile(c: Context<HonoEnv>) {
    try {
      const admin = c.get("user");
      if (!admin) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const { accountId, accountType, updates } = body;

      if (!accountId || !accountType || !updates) {
        return sendError(c, "accountId, accountType, and updates are required", 400);
      }

      const db = getDb(c.env);

      if (accountType === "influencer") {
        await db
          .update(schema.influencerAccounts)
          .set({ 
            instagramHandle: updates.instagramHandle,
            followers: updates.followers,
            engagementRate: updates.engagementRate,
            avgViews: updates.avgViews,
            avgLikes: updates.avgLikes,
            niche: updates.niche,
            pricing: updates.pricing,
            level: updates.level,
            country: updates.country,
            bio: updates.bio,
            updatedAt: new Date() 
          })
          .where(eq(schema.influencerAccounts.id, accountId));
      } else if (accountType === "brand") {
        await db
          .update(schema.brandAccounts)
          .set({ 
            companyName: updates.companyName,
            website: updates.website,
            category: updates.category,
            description: updates.description,
            instagramPage: updates.instagramPage,
            brandSize: updates.brandSize,
            budgetRange: updates.budgetRange,
            updatedAt: new Date() 
          })
          .where(eq(schema.brandAccounts.id, accountId));
      } else {
        return sendError(c, "Invalid accountType", 400);
      }

      return sendSuccess(c, { accountId, accountType }, "Profile updated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to update profile", 500);
    }
  }
}

