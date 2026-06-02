import { Context } from "hono";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { sendSuccess, sendError } from "../utils/response";
import { HonoEnv } from "../types";

export class ArenaController {
  
  static async getActiveArenas(c: Context<HonoEnv>) {
    try {
      const db = getDb(c.env);
      const arenas = await db
        .select({
          id: schema.campaigns.id,
          title: schema.campaigns.title,
          description: schema.campaigns.description,
          budget: schema.campaigns.budget,
          campaignType: schema.campaigns.campaignType,
          maxReachCap: schema.campaigns.maxReachCap,
          createdAt: schema.campaigns.createdAt,
          brandName: schema.brandProfiles.companyName,
          brandLogo: schema.brandProfiles.logo,
        })
        .from(schema.campaigns)
        .innerJoin(schema.brandProfiles, eq(schema.campaigns.brandId, schema.brandProfiles.userId))
        .where(and(eq(schema.campaigns.isArena, true), eq(schema.campaigns.status, "active")))
        .orderBy(desc(schema.campaigns.createdAt));

      return sendSuccess(c, arenas, "Active arenas retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch active arenas", 500);
    }
  }

  static async getArenaLeaderboard(c: Context<HonoEnv>) {
    try {
      const campaignId = c.req.param("id");
      if (!campaignId) return sendError(c, "Campaign ID is required", 400);

      const db = getDb(c.env);
      const participants = await db
        .select({
          id: schema.arenaParticipants.id,
          influencerId: schema.arenaParticipants.influencerId,
          postUrl: schema.arenaParticipants.postUrl,
          accountReach: schema.arenaParticipants.accountReach,
          coinsAwarded: schema.arenaParticipants.coinsAwarded,
          status: schema.arenaParticipants.status,
          name: schema.users.name,
          avatar: schema.users.image,
          instagramHandle: sql<string>`COALESCE(${schema.influencerAccounts.instagramHandle}, ${schema.influencerProfiles.instagramHandle})`.as("instagramHandle"),
        })
        .from(schema.arenaParticipants)
        .innerJoin(schema.influencerProfiles, eq(schema.arenaParticipants.influencerId, schema.influencerProfiles.userId))
        .innerJoin(schema.users, eq(schema.influencerProfiles.userId, schema.users.id))
        .leftJoin(schema.influencerAccounts, eq(schema.arenaParticipants.influencerAccountId, schema.influencerAccounts.id))
        .where(eq(schema.arenaParticipants.campaignId, campaignId))
        .orderBy(desc(schema.arenaParticipants.accountReach));

      return sendSuccess(c, participants, "Arena leaderboard retrieved");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch leaderboard", 500);
    }
  }

  static async joinArena(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user || user.role !== "influencer") return sendError(c, "Unauthorized", 401);

      const campaignId = c.req.param("id");
      if (!campaignId) return sendError(c, "Campaign ID is required", 400);

      const db = getDb(c.env);

      // Verify campaign is active arena
      const campaign = await db.select().from(schema.campaigns).where(eq(schema.campaigns.id, campaignId)).get();
      if (!campaign || !campaign.isArena || campaign.status !== "active") {
        return sendError(c, "Invalid or inactive Arena contest", 400);
      }

      // Check if already joined
      const existing = await db
        .select()
        .from(schema.arenaParticipants)
        .where(and(eq(schema.arenaParticipants.campaignId, campaignId), eq(schema.arenaParticipants.influencerId, user.id)))
        .get();

      if (existing) {
        return sendError(c, "You have already joined this Arena", 400);
      }

      // We initialize their reach to their selected account reach, or default profile reach.
      const body = await c.req.json().catch(() => ({}));
      const influencerAccountId = body.influencerAccountId || null;

      let accountReach = 0;
      if (influencerAccountId) {
        const acc = await db.select().from(schema.influencerAccounts).where(eq(schema.influencerAccounts.id, influencerAccountId)).get();
        if (acc) accountReach = acc.avgViews;
      } else {
        const profile = await db.select().from(schema.influencerProfiles).where(eq(schema.influencerProfiles.userId, user.id)).get();
        if (profile) accountReach = profile.avgViews;
      }
      
      const newParticipant = {
        id: crypto.randomUUID(),
        campaignId,
        influencerId: user.id,
        influencerAccountId,
        accountReach,
        status: "pending" as const,
        createdAt: new Date(),
      };

      await db.insert(schema.arenaParticipants).values(newParticipant);

      return sendSuccess(c, newParticipant, "Successfully joined the Arena!", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to join arena", 500);
    }
  }
}
