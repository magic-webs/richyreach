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
        influencerAccounts: influencerAccounts.map(r => ({ ...r.account, ownerName: r.user?.name, ownerEmail: r.user?.email })),
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
}

