import { Context } from "hono";
import { HonoEnv } from "../types";
import { sendSuccess, sendError } from "../utils/response";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";

const CATEGORIES = ["Fashion", "Technology", "Food & Beverage", "Health & Wellness", "Sports", "Beauty", "Travel", "Entertainment", "Finance", "Education", "Retail", "General"];

export class BrandAccountsController {
  // GET /brands/accounts
  static async listAccounts(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const db = getDb(c.env);
      const accounts = await db
        .select()
        .from(schema.brandAccounts)
        .where(eq(schema.brandAccounts.userId, user.id))
        .all();

      return sendSuccess(c, accounts, "Brand accounts retrieved");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch accounts", 500);
    }
  }

  // POST /brands/accounts
  static async addAccount(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const { companyName, website = "", logo, category = "General", description, instagramPage, brandSize = "smb", budgetRange = "mid" } = body;

      if (!companyName?.trim()) {
        return sendError(c, "Company name is required", 400);
      }

      const db = getDb(c.env);
      const id = `bacc_${crypto.randomUUID()}`;

      await db.insert(schema.brandAccounts).values({
        id,
        userId: user.id,
        companyName: companyName.trim(),
        website: website.trim() || "",
        logo: logo || null,
        category: CATEGORIES.includes(category) ? category : "General",
        description: description || null,
        instagramPage: instagramPage || null,
        brandSize: ["startup", "smb", "enterprise"].includes(brandSize) ? brandSize : "smb",
        budgetRange: ["low", "mid", "high", "enterprise"].includes(budgetRange) ? budgetRange : "mid",
        status: "pending",
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const created = await db
        .select()
        .from(schema.brandAccounts)
        .where(eq(schema.brandAccounts.id, id))
        .get();

      return sendSuccess(c, created, "Brand account submitted for verification", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to add brand account", 500);
    }
  }

  // PUT /brands/accounts/:id
  static async updateAccount(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const accountId = c.req.param("id") || "";
      const db = getDb(c.env);

      const existing = await db
        .select()
        .from(schema.brandAccounts)
        .where(and(eq(schema.brandAccounts.id, accountId), eq(schema.brandAccounts.userId, user.id)))
        .get();

      if (!existing) return sendError(c, "Brand account not found", 404);

      const body = await c.req.json();
      const { companyName, website, logo, category, description, instagramPage, brandSize, budgetRange } = body;

      await db
        .update(schema.brandAccounts)
        .set({
          companyName: companyName?.trim() || existing.companyName,
          website: website !== undefined ? website.trim() : existing.website,
          logo: logo !== undefined ? logo : existing.logo,
          category: category ? (CATEGORIES.includes(category) ? category : existing.category) : existing.category,
          description: description !== undefined ? description : existing.description,
          instagramPage: instagramPage !== undefined ? instagramPage : existing.instagramPage,
          brandSize: brandSize !== undefined ? brandSize : existing.brandSize,
          budgetRange: budgetRange !== undefined ? budgetRange : existing.budgetRange,
          // Re-submit for verification if not already verified
          status: existing.status === "verified" ? "verified" : "pending",
          updatedAt: new Date(),
        })
        .where(eq(schema.brandAccounts.id, accountId));

      const updated = await db
        .select()
        .from(schema.brandAccounts)
        .where(eq(schema.brandAccounts.id, accountId))
        .get();

      return sendSuccess(c, updated, "Brand account updated successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to update brand account", 500);
    }
  }

  // DELETE /brands/accounts/:id
  static async deleteAccount(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const accountId = c.req.param("id") || "";
      const db = getDb(c.env);

      const existing = await db
        .select()
        .from(schema.brandAccounts)
        .where(and(eq(schema.brandAccounts.id, accountId), eq(schema.brandAccounts.userId, user.id)))
        .get();

      if (!existing) return sendError(c, "Brand account not found", 404);

      await db
        .delete(schema.brandAccounts)
        .where(eq(schema.brandAccounts.id, accountId));

      return sendSuccess(c, null, "Brand account removed");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to delete brand account", 500);
    }
  }
}
