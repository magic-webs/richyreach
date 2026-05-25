import { eq, and, gte, lte, like, sql, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { fetchInstagramProfile } from "../utils/instagram-api";

export class InfluencerService {
  static async getInfluencers(
    env: Record<string, any>,
    filters: {
      niche?: string;
      level?: "nano" | "micro" | "mid" | "macro" | "mega";
      minFollowers?: number;
      maxPricing?: number;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const db = getDb(env);
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

    const conditions = [];

    if (filters.niche) {
      conditions.push(like(schema.influencerProfiles.niche, `%${filters.niche}%`));
    }
    if (filters.level) {
      conditions.push(eq(schema.influencerProfiles.level, filters.level));
    }
    if (filters.minFollowers) {
      conditions.push(gte(schema.influencerProfiles.followers, filters.minFollowers));
    }
    if (filters.maxPricing) {
      conditions.push(lte(schema.influencerProfiles.pricing, filters.maxPricing));
    }
    
    // Add user name search if specified
    let query = db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.image,
        bio: schema.users.bio,
        instagramHandle: schema.influencerProfiles.instagramHandle,
        followers: schema.influencerProfiles.followers,
        engagementRate: schema.influencerProfiles.engagementRate,
        niche: schema.influencerProfiles.niche,
        avgViews: schema.influencerProfiles.avgViews,
        pricing: schema.influencerProfiles.pricing,
        verified: schema.influencerProfiles.verified,
        level: schema.influencerProfiles.level,
      })
      .from(schema.influencerProfiles)
      .innerJoin(schema.users, eq(schema.influencerProfiles.userId, schema.users.id));

    if (filters.search) {
      conditions.push(
        sql`(${schema.users.name} LIKE ${`%${filters.search}%`} OR ${schema.influencerProfiles.instagramHandle} LIKE ${`%${filters.search}%`})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.influencerProfiles)
      .innerJoin(schema.users, eq(schema.influencerProfiles.userId, schema.users.id))
      .where(whereClause);

    const total = countResult[0]?.count || 0;

    const items = await query
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(schema.influencerProfiles.followers));

    return {
      items,
      total,
    };
  }

  static async getInfluencerById(env: Record<string, any>, userId: string) {
    const db = getDb(env);

    const profile = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        avatar: schema.users.image,
        bio: schema.users.bio,
        instagramHandle: schema.influencerProfiles.instagramHandle,
        followers: schema.influencerProfiles.followers,
        engagementRate: schema.influencerProfiles.engagementRate,
        niche: schema.influencerProfiles.niche,
        avgViews: schema.influencerProfiles.avgViews,
        pricing: schema.influencerProfiles.pricing,
        verified: schema.influencerProfiles.verified,
        level: schema.influencerProfiles.level,
      })
      .from(schema.influencerProfiles)
      .innerJoin(schema.users, eq(schema.influencerProfiles.userId, schema.users.id))
      .where(eq(schema.influencerProfiles.userId, userId))
      .get();

    if (!profile) return null;

    const skills = await db
      .select()
      .from(schema.creatorSkills)
      .where(eq(schema.creatorSkills.influencerId, userId));

    const portfolio = await db
      .select()
      .from(schema.creatorPortfolio)
      .where(eq(schema.creatorPortfolio.influencerId, userId));

    return {
      ...profile,
      skills: skills.map((s) => s.skill),
      portfolio,
    };
  }

  static async createOrUpdateProfile(
    env: Record<string, any>,
    userId: string,
    profileData: {
      instagramHandle: string;
      pricing: number;
      niche: string;
      skills?: string[];
      portfolioItems?: {
        mediaUrl: string;
        mediaType: "image" | "video";
        title?: string;
        description?: string;
      }[];
    }
  ) {
    const db = getDb(env);

    // 1. Fetch Instagram data using helper
    const instaData = await fetchInstagramProfile(profileData.instagramHandle);

    // 2. Upsert profile details
    await db
      .insert(schema.influencerProfiles)
      .values({
        userId,
        instagramHandle: instaData.instagramHandle,
        followers: instaData.followers,
        engagementRate: instaData.engagementRate,
        niche: profileData.niche || instaData.niche,
        avgViews: instaData.avgViews,
        pricing: profileData.pricing,
        verified: false,
        level: instaData.level,
      })
      .onConflictDoUpdate({
        target: schema.influencerProfiles.userId,
        set: {
          instagramHandle: instaData.instagramHandle,
          followers: instaData.followers,
          engagementRate: instaData.engagementRate,
          niche: profileData.niche || instaData.niche,
          avgViews: instaData.avgViews,
          pricing: profileData.pricing,
          level: instaData.level,
        },
      });

    // Update main user bio & avatar
    await db
      .update(schema.users)
      .set({
        image: instaData.profilePicture,
        bio: instaData.bio,
      })
      .where(eq(schema.users.id, userId));

    // 3. Upsert skills if provided
    if (profileData.skills) {
      await db.delete(schema.creatorSkills).where(eq(schema.creatorSkills.influencerId, userId));
      if (profileData.skills.length > 0) {
        await db.insert(schema.creatorSkills).values(
          profileData.skills.map((skill) => ({
            id: crypto.randomUUID(),
            influencerId: userId,
            skill,
          }))
        );
      }
    }

    // 4. Upsert portfolio items if provided
    if (profileData.portfolioItems) {
      await db.delete(schema.creatorPortfolio).where(eq(schema.creatorPortfolio.influencerId, userId));
      if (profileData.portfolioItems.length > 0) {
        await db.insert(schema.creatorPortfolio).values(
          profileData.portfolioItems.map((item) => ({
            id: crypto.randomUUID(),
            influencerId: userId,
            mediaUrl: item.mediaUrl,
            mediaType: item.mediaType,
            title: item.title,
            description: item.description,
          }))
        );
      }
    } else {
      // populate with mock portfolio from scraped posts
      await db.delete(schema.creatorPortfolio).where(eq(schema.creatorPortfolio.influencerId, userId));
      await db.insert(schema.creatorPortfolio).values(
        instaData.recentPosts.map((post) => ({
          id: crypto.randomUUID(),
          influencerId: userId,
          mediaUrl: post.mediaUrl,
          mediaType: post.mediaType,
          title: post.caption?.slice(0, 30) || "Portfolio Item",
          description: post.caption || "",
        }))
      );
    }

    return this.getInfluencerById(env, userId);
  }

  static async applyToCampaign(
    env: Record<string, any>,
    influencerId: string,
    campaignId: string,
    proposal: string
  ) {
    const db = getDb(env);

    // Verify campaign exists
    const campaign = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .get();

    if (!campaign) throw new Error("Campaign not found");

    const id = crypto.randomUUID();
    const application = {
      id,
      influencerId,
      campaignId,
      proposal,
      status: "pending" as const,
      createdAt: new Date(),
    };

    await db.insert(schema.campaignApplications).values(application);

    // Trigger Notification for Brand
    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: campaign.brandId, // Send to brand
      title: "New Campaign Application",
      message: `An influencer applied to your campaign "${campaign.title}"`,
      read: false,
      createdAt: new Date(),
    });

    return application;
  }

  static async getCampaigns(env: Record<string, any>, influencerId: string) {
    const db = getDb(env);

    const applications = await db
      .select({
        applicationId: schema.campaignApplications.id,
        status: schema.campaignApplications.status,
        proposal: schema.campaignApplications.proposal,
        createdAt: schema.campaignApplications.createdAt,
        campaignId: schema.campaigns.id,
        campaignTitle: schema.campaigns.title,
        campaignDescription: schema.campaigns.description,
        budget: schema.campaigns.budget,
        statusCampaign: schema.campaigns.status,
      })
      .from(schema.campaignApplications)
      .innerJoin(schema.campaigns, eq(schema.campaignApplications.campaignId, schema.campaigns.id))
      .where(eq(schema.campaignApplications.influencerId, influencerId));

    const invites = await db
      .select({
        inviteId: schema.campaignInvites.id,
        status: schema.campaignInvites.status,
        createdAt: schema.campaignInvites.createdAt,
        campaignId: schema.campaigns.id,
        campaignTitle: schema.campaigns.title,
        campaignDescription: schema.campaigns.description,
        budget: schema.campaigns.budget,
      })
      .from(schema.campaignInvites)
      .innerJoin(schema.campaigns, eq(schema.campaignInvites.campaignId, schema.campaigns.id))
      .where(eq(schema.campaignInvites.influencerId, influencerId));

    return {
      applications,
      invites,
    };
  }

  static async getDashboardData(env: Record<string, any>, userId: string) {
    const db = getDb(env);

    // 1. Total Earnings (cleared)
    const earningsSum = await db
      .select({ total: sql<number>`sum(${schema.earnings.amount})` })
      .from(schema.earnings)
      .where(and(eq(schema.earnings.influencerId, userId), eq(schema.earnings.status, "cleared")))
      .get();
    
    // 2. Active Campaigns
    const activeCampaigns = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.campaignApplications)
      .where(and(eq(schema.campaignApplications.influencerId, userId), eq(schema.campaignApplications.status, "accepted")))
      .get();

    // 3. Pending Applications
    const pendingApps = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.campaignApplications)
      .where(and(eq(schema.campaignApplications.influencerId, userId), eq(schema.campaignApplications.status, "pending")))
      .get();

    // 4. Analytics overview (Mock or derived from logs)
    const reach = await db
      .select({ total: sql<number>`sum(${schema.analytics.metricValue})` })
      .from(schema.analytics)
      .where(and(eq(schema.analytics.entityId, userId), eq(schema.analytics.metricName, "reach")))
      .get();

    return {
      totalEarnings: earningsSum?.total || 0,
      activeCampaigns: activeCampaigns?.count || 0,
      pendingApplications: pendingApps?.count || 0,
      analyticsOverview: {
        totalReach: reach?.total || 0,
        monthlyViews: 45000,
        averageEngagement: 4.8,
      },
    };
  }

  static async getEarnings(env: Record<string, any>, influencerId: string) {
    const db = getDb(env);
    return db
      .select()
      .from(schema.earnings)
      .where(eq(schema.earnings.influencerId, influencerId))
      .orderBy(desc(schema.earnings.createdAt));
  }

  static async getAnalytics(env: Record<string, any>, influencerId: string) {
    const db = getDb(env);
    return db
      .select()
      .from(schema.analytics)
      .where(and(eq(schema.analytics.entityId, influencerId), eq(schema.analytics.entityType, "influencer")))
      .orderBy(desc(schema.analytics.recordedAt));
  }
}
