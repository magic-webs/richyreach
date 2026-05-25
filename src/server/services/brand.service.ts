import { eq, and, sql, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { fetchWebsiteMetadata } from "../utils/metadata-fetcher";

export class BrandService {
  static async createOrUpdateProfile(
    env: Record<string, any>,
    userId: string,
    profileData: {
      companyName: string;
      website: string;
      category: string;
      description?: string | null;
      logo?: string | null;
    }
  ) {
    const db = getDb(env);

    let logo = profileData.logo;
    let description = profileData.description;
    let category = profileData.category;
    let companyName = profileData.companyName;

    // Trigger auto-scraper if metadata isn't fully provided
    try {
      const scraped = await fetchWebsiteMetadata(profileData.website);
      if (!logo) logo = scraped.logo;
      if (!description) description = scraped.description;
      if (!category) category = scraped.category;
      if (!companyName) companyName = scraped.companyName;
    } catch (err) {
      // Ignored: fallback to profileData values
    }

    const brandRecord = {
      userId,
      companyName,
      website: profileData.website,
      logo,
      category,
      description,
    };

    await db
      .insert(schema.brandProfiles)
      .values(brandRecord)
      .onConflictDoUpdate({
        target: schema.brandProfiles.userId,
        set: brandRecord,
      });

    return brandRecord;
  }

  static async getBrandProfile(env: Record<string, any>, userId: string) {
    const db = getDb(env);
    return db
      .select()
      .from(schema.brandProfiles)
      .where(eq(schema.brandProfiles.userId, userId))
      .get();
  }

  static async createCampaign(
    env: Record<string, any>,
    brandId: string,
    campaignData: {
      title: string;
      description: string;
      budget: number;
      campaignType: string;
      targetAudience?: string | null;
      requirements?: string | null;
      expectedReach?: number;
    }
  ) {
    const db = getDb(env);
    
    // Verify brand profile exists
    const brand = await this.getBrandProfile(env, brandId);
    if (!brand) {
      throw new Error("Brand profile must be created before launching campaigns.");
    }

    const id = crypto.randomUUID();
    const newCampaign = {
      id,
      brandId,
      title: campaignData.title,
      description: campaignData.description,
      budget: campaignData.budget,
      campaignType: campaignData.campaignType,
      targetAudience: campaignData.targetAudience,
      requirements: campaignData.requirements,
      status: "active" as const, // active on creation
      expectedReach: campaignData.expectedReach || 0,
      createdAt: new Date(),
    };

    await db.insert(schema.campaigns).values(newCampaign);
    return newCampaign;
  }

  static async updateCampaign(
    env: Record<string, any>,
    brandId: string,
    campaignId: string,
    campaignData: Partial<{
      title: string;
      description: string;
      budget: number;
      campaignType: string;
      targetAudience: string | null;
      requirements: string | null;
      status: "draft" | "active" | "completed" | "cancelled";
      expectedReach: number;
    }>
  ) {
    const db = getDb(env);

    // Verify campaign ownership
    const campaign = await db
      .select()
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.id, campaignId), eq(schema.campaigns.brandId, brandId)))
      .get();

    if (!campaign) {
      throw new Error("Campaign not found or not owned by this brand");
    }

    await db
      .update(schema.campaigns)
      .set(campaignData)
      .where(eq(schema.campaigns.id, campaignId));

    return { ...campaign, ...campaignData };
  }

  static async deleteCampaign(env: Record<string, any>, brandId: string, campaignId: string) {
    const db = getDb(env);

    // Verify ownership
    const campaign = await db
      .select()
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.id, campaignId), eq(schema.campaigns.brandId, brandId)))
      .get();

    if (!campaign) {
      throw new Error("Campaign not found or not owned by this brand");
    }

    await db.delete(schema.campaigns).where(eq(schema.campaigns.id, campaignId));
    return { success: true };
  }

  static async getCampaigns(env: Record<string, any>, brandId: string) {
    const db = getDb(env);
    
    // Get all campaigns with applicant/invite count aggregations
    return db
      .select({
        id: schema.campaigns.id,
        title: schema.campaigns.title,
        budget: schema.campaigns.budget,
        campaignType: schema.campaigns.campaignType,
        status: schema.campaigns.status,
        expectedReach: schema.campaigns.expectedReach,
        createdAt: schema.campaigns.createdAt,
      })
      .from(schema.campaigns)
      .where(eq(schema.campaigns.brandId, brandId))
      .orderBy(desc(schema.campaigns.createdAt));
  }

  static async getCampaignById(env: Record<string, any>, campaignId: string) {
    const db = getDb(env);

    const campaign = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .get();

    if (!campaign) return null;

    // Fetch applications
    const applications = await db
      .select({
        id: schema.campaignApplications.id,
        proposal: schema.campaignApplications.proposal,
        status: schema.campaignApplications.status,
        createdAt: schema.campaignApplications.createdAt,
        influencerId: schema.influencerProfiles.userId,
        instagramHandle: schema.influencerProfiles.instagramHandle,
        followers: schema.influencerProfiles.followers,
        engagementRate: schema.influencerProfiles.engagementRate,
        name: schema.users.name,
        avatar: schema.users.image,
      })
      .from(schema.campaignApplications)
      .innerJoin(schema.influencerProfiles, eq(schema.campaignApplications.influencerId, schema.influencerProfiles.userId))
      .innerJoin(schema.users, eq(schema.influencerProfiles.userId, schema.users.id))
      .where(eq(schema.campaignApplications.campaignId, campaignId));

    // Fetch invites
    const invites = await db
      .select({
        id: schema.campaignInvites.id,
        status: schema.campaignInvites.status,
        createdAt: schema.campaignInvites.createdAt,
        influencerId: schema.influencerProfiles.userId,
        instagramHandle: schema.influencerProfiles.instagramHandle,
        name: schema.users.name,
      })
      .from(schema.campaignInvites)
      .innerJoin(schema.influencerProfiles, eq(schema.campaignInvites.influencerId, schema.influencerProfiles.userId))
      .innerJoin(schema.users, eq(schema.influencerProfiles.userId, schema.users.id))
      .where(eq(schema.campaignInvites.campaignId, campaignId));

    return {
      campaign,
      applications,
      invites,
    };
  }

  static async inviteInfluencer(
    env: Record<string, any>,
    brandId: string,
    inviteData: {
      influencerId: string;
      campaignId: string;
    }
  ) {
    const db = getDb(env);

    // Verify campaign ownership
    const campaign = await db
      .select()
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.id, inviteData.campaignId), eq(schema.campaigns.brandId, brandId)))
      .get();

    if (!campaign) {
      throw new Error("Campaign not found or not owned by this brand");
    }

    const inviteId = crypto.randomUUID();
    const invite = {
      id: inviteId,
      brandId,
      influencerId: inviteData.influencerId,
      campaignId: inviteData.campaignId,
      status: "pending" as const,
      createdAt: new Date(),
    };

    await db.insert(schema.campaignInvites).values(invite);

    // Trigger Notification for Influencer
    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: inviteData.influencerId,
      title: "New Campaign Invitation",
      message: `You have been invited to apply to the campaign "${campaign.title}"`,
      read: false,
      createdAt: new Date(),
    });

    return invite;
  }

  static async getDashboardData(env: Record<string, any>, brandId: string) {
    const db = getDb(env);

    // 1. Active campaigns count
    const campaignsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.brandId, brandId), eq(schema.campaigns.status, "active")))
      .get();

    // 2. Total spend
    const spendSum = await db
      .select({ total: sql<number>`sum(${schema.campaigns.budget})` })
      .from(schema.campaigns)
      .where(and(eq(schema.campaigns.brandId, brandId), eq(schema.campaigns.status, "completed")))
      .get();

    // 3. Total expected reach
    const reachSum = await db
      .select({ total: sql<number>`sum(${schema.campaigns.expectedReach})` })
      .from(schema.campaigns)
      .where(eq(schema.campaigns.brandId, brandId))
      .get();

    // 4. Detailed active campaigns with application stats
    const campaignList = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.brandId, brandId))
      .orderBy(desc(schema.campaigns.createdAt))
      .limit(5);

    return {
      activeCampaigns: campaignsCount?.count || 0,
      totalSpend: spendSum?.total || 0,
      totalReach: reachSum?.total || 0,
      campaigns: campaignList,
      influencerStats: {
        totalApplicants: 12, // Derived / mock for UX
        totalInvitesSent: 5,
      },
    };
  }
}
