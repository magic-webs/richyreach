import { eq, sql, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";

export class AdminService {
  static async getUsers(env: Record<string, any>) {
    const db = getDb(env);

    return db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));
  }

  static async getCampaigns(env: Record<string, any>) {
    const db = getDb(env);

    return db
      .select({
        id: schema.campaigns.id,
        title: schema.campaigns.title,
        budget: schema.campaigns.budget,
        status: schema.campaigns.status,
        expectedReach: schema.campaigns.expectedReach,
        createdAt: schema.campaigns.createdAt,
        companyName: schema.brandProfiles.companyName,
      })
      .from(schema.campaigns)
      .innerJoin(schema.brandProfiles, eq(schema.campaigns.brandId, schema.brandProfiles.userId))
      .orderBy(desc(schema.campaigns.createdAt));
  }

  static async getReports(env: Record<string, any>) {
    const db = getDb(env);

    const userStats = await db
      .select({
        count: sql<number>`count(*)`,
        role: schema.users.role,
      })
      .from(schema.users)
      .groupBy(schema.users.role);

    const campaignStats = await db
      .select({
        totalBudgets: sql<number>`sum(${schema.campaigns.budget})`,
        count: sql<number>`count(*)`,
      })
      .from(schema.campaigns)
      .get();

    return {
      usersByRole: userStats,
      campaignSummary: {
        totalCount: campaignStats?.count || 0,
        totalBudgetsCents: campaignStats?.totalBudgets || 0,
      },
      auditLogs: [
        { action: "USER_SIGNUP", message: "New user registered as influencer", timestamp: new Date() },
        { action: "CAMPAIGN_CREATE", message: "Brand created a new campaign", timestamp: new Date(Date.now() - 3600000) },
      ],
    };
  }

  static async deleteUser(env: Record<string, any>, userId: string) {
    const db = getDb(env);
    
    // Cascades will delete associated sessions, accounts, and profiles
    await db.delete(schema.users).where(eq(schema.users.id, userId));
    return { success: true };
  }
}
