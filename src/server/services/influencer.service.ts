import { eq, and, gte, lte, like, sql, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { fetchInstagramProfile } from "../utils/instagram-api";

// ==========================================
// Reach Score Calculator (6-factor model)
// ==========================================
function calculateReachScore(profile: {
  followers: number;
  engagementRate: number;
  postingFrequency: number;
  growthRate: number;
  avgViews: number;
  avgLikes: number;
}): { score: number; breakdown: Record<string, number> } {
  // Factor 1: Followers (20%) — log-normalized to 10M ceiling
  const followersScore = Math.min(100, (Math.log10(profile.followers + 1) / Math.log10(10_000_000)) * 100) * 0.20;

  // Factor 2: Engagement Rate (25%) — ideal is 3-10%
  const engagementScore = Math.min(100, (Math.min(profile.engagementRate, 10) / 10) * 100) * 0.25;

  // Factor 3: Consistency / Posting Frequency (15%) — ideal is 7 posts/week
  const consistencyScore = Math.min(100, (Math.min(profile.postingFrequency, 7) / 7) * 100) * 0.15;

  // Factor 4: Audience Quality Estimate (15%) — avg likes relative to followers
  const rawAudienceQual = profile.followers > 0 ? Math.min((profile.avgLikes / profile.followers) * 1000, 100) : 0;
  const audienceQualityScore = rawAudienceQual * 0.15;

  // Factor 5: Growth Rate (10%)
  const growthScore = Math.min(100, (Math.min(profile.growthRate, 20) / 20) * 100) * 0.10;

  // Factor 6: Recent Performance / Avg Views (15%)
  const viewsScore = Math.min(100, (Math.log10(profile.avgViews + 1) / Math.log10(1_000_000)) * 100) * 0.15;

  const total = Math.round(followersScore + engagementScore + consistencyScore + audienceQualityScore + growthScore + viewsScore);

  return {
    score: Math.min(100, total),
    breakdown: {
      followers: Math.round(followersScore / 0.20),
      engagement: Math.round(engagementScore / 0.25),
      consistency: Math.round(consistencyScore / 0.15),
      audienceQuality: rawAudienceQual > 0 ? Math.round(rawAudienceQual) : 0,
      growth: Math.round(growthScore / 0.10),
      recentPerformance: Math.round(viewsScore / 0.15),
    },
  };
}

export class InfluencerService {
  static async getInfluencers(
    env: Record<string, any>,
    filters: {
      niche?: string;
      level?: "nano" | "micro" | "mid" | "macro" | "mega";
      minFollowers?: number;
      maxPricing?: number;
      minReachScore?: number;
      country?: string;
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
    if (filters.minReachScore) {
      conditions.push(gte(schema.influencerProfiles.reachScore, filters.minReachScore));
    }
    if (filters.country) {
      conditions.push(eq(schema.influencerProfiles.country, filters.country));
    }

    const query = db
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
        avgLikes: schema.influencerProfiles.avgLikes,
        pricing: schema.influencerProfiles.pricing,
        verified: schema.influencerProfiles.verified,
        level: schema.influencerProfiles.level,
        reachScore: schema.influencerProfiles.reachScore,
        country: schema.influencerProfiles.country,
        postingFrequency: schema.influencerProfiles.postingFrequency,
        growthRate: schema.influencerProfiles.growthRate,
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
      .orderBy(desc(schema.influencerProfiles.reachScore));

    return { items, total };
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
        avgLikes: schema.influencerProfiles.avgLikes,
        pricing: schema.influencerProfiles.pricing,
        verified: schema.influencerProfiles.verified,
        level: schema.influencerProfiles.level,
        reachScore: schema.influencerProfiles.reachScore,
        country: schema.influencerProfiles.country,
        socialLinks: schema.influencerProfiles.socialLinks,
        audienceDemographics: schema.influencerProfiles.audienceDemographics,
        postingFrequency: schema.influencerProfiles.postingFrequency,
        growthRate: schema.influencerProfiles.growthRate,
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

    // Parse JSON fields safely
    let socialLinks: any = {};
    let audienceDemographics: any = null;
    try { if (profile.socialLinks) socialLinks = JSON.parse(profile.socialLinks); } catch (_) {}
    try { if (profile.audienceDemographics) audienceDemographics = JSON.parse(profile.audienceDemographics); } catch (_) {}

    // Compute reach score breakdown for display
    const { breakdown } = calculateReachScore({
      followers: profile.followers,
      engagementRate: profile.engagementRate,
      postingFrequency: profile.postingFrequency || 0,
      growthRate: profile.growthRate || 0,
      avgViews: profile.avgViews,
      avgLikes: profile.avgLikes || 0,
    });

    return {
      ...profile,
      socialLinks,
      audienceDemographics,
      reachScoreBreakdown: breakdown,
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
      country?: string;
      socialLinks?: Record<string, string>;
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

    // 1.5 Check if instagram handle is already used by another user
    const existingHandle = await db
      .select()
      .from(schema.influencerProfiles)
      .where(eq(schema.influencerProfiles.instagramHandle, instaData.instagramHandle))
      .get();
      
    if (existingHandle && existingHandle.userId !== userId) {
      throw new Error("This Instagram handle is already linked to another account.");
    }

    // 2. Compute Reach Score
    const postingFrequency = (instaData as any).postingFrequency || 4;
    const growthRate = (instaData as any).growthRate || 2.5;
    const avgLikes = Math.round(instaData.followers * (instaData.engagementRate / 100) * 0.6);
    const { score: reachScore, breakdown } = calculateReachScore({
      followers: instaData.followers,
      engagementRate: instaData.engagementRate,
      postingFrequency,
      growthRate,
      avgViews: instaData.avgViews,
      avgLikes,
    });

    // 3. Upsert profile details
    const profileRecord = {
      userId,
      instagramHandle: instaData.instagramHandle,
      followers: instaData.followers,
      engagementRate: instaData.engagementRate,
      niche: profileData.niche || instaData.niche,
      avgViews: instaData.avgViews,
      avgLikes,
      pricing: profileData.pricing,
      verified: false,
      level: instaData.level,
      reachScore,
      country: profileData.country || "India",
      postingFrequency,
      growthRate,
      socialLinks: profileData.socialLinks ? JSON.stringify(profileData.socialLinks) : null,
    };

    await db
      .insert(schema.influencerProfiles)
      .values(profileRecord)
      .onConflictDoUpdate({
        target: schema.influencerProfiles.userId,
        set: profileRecord,
      });

    // Save reach score history
    await db.insert(schema.reachScores).values({
      id: crypto.randomUUID(),
      influencerId: userId,
      score: reachScore,
      breakdown: JSON.stringify(breakdown),
    });

    // Update main user bio & avatar
    await db
      .update(schema.users)
      .set({
        image: instaData.profilePicture,
        bio: instaData.bio,
      })
      .where(eq(schema.users.id, userId));

    // 4. Upsert skills if provided
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

    // 5. Portfolio items
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

  // ==========================================
  // Marketplace — Campaigns for Influencers
  // ==========================================
  static async getMarketplaceCampaigns(
    env: Record<string, any>,
    influencerId: string,
    filters: {
      category?: string;
      campaignType?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const db = getDb(env);
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const campaigns = await db
      .select({
        id: schema.campaigns.id,
        title: schema.campaigns.title,
        description: schema.campaigns.description,
        budget: schema.campaigns.budget,
        campaignType: schema.campaigns.campaignType,
        targetAudience: schema.campaigns.targetAudience,
        requirements: schema.campaigns.requirements,
        status: schema.campaigns.status,
        expectedReach: schema.campaigns.expectedReach,
        createdAt: schema.campaigns.createdAt,
        brandId: schema.brandProfiles.userId,
        brandName: schema.brandProfiles.companyName,
        brandLogo: schema.brandProfiles.logo,
        brandCategory: schema.brandProfiles.category,
      })
      .from(schema.campaigns)
      .innerJoin(schema.brandProfiles, eq(schema.campaigns.brandId, schema.brandProfiles.userId))
      .where(eq(schema.campaigns.status, "active"))
      .orderBy(desc(schema.campaigns.createdAt))
      .limit(limit)
      .offset(offset);

    const applications = await db
      .select({ 
        campaignId: schema.campaignApplications.campaignId,
        status: schema.campaignApplications.status
      })
      .from(schema.campaignApplications)
      .where(eq(schema.campaignApplications.influencerId, influencerId));

    const saved = await db
      .select({ campaignId: schema.savedCampaigns.campaignId })
      .from(schema.savedCampaigns)
      .where(eq(schema.savedCampaigns.influencerId, influencerId));

    const invites = await db
      .select({ campaignId: schema.campaignInvites.campaignId })
      .from(schema.campaignInvites)
      .where(eq(schema.campaignInvites.influencerId, influencerId));

    const applicationMap = new Map(applications.map((a) => [a.campaignId, a.status]));
    const savedIds = new Set(saved.map((s) => s.campaignId));
    const invitedIds = new Set(invites.map((i) => i.campaignId));

    const influencerProfile = await db
      .select()
      .from(schema.influencerProfiles)
      .where(eq(schema.influencerProfiles.userId, influencerId))
      .get();

    return campaigns.map((c) => ({
      ...c,
      isApplied: applicationMap.has(c.id),
      applicationStatus: applicationMap.get(c.id),
      isSaved: savedIds.has(c.id),
      isInvited: invitedIds.has(c.id),
      isRecommended: influencerProfile
        ? (c.brandCategory?.toLowerCase() || "").includes((influencerProfile.niche || "").toLowerCase()) ||
          (c.budget >= 50000 && (influencerProfile.reachScore || 0) > 50)
        : false,
    }));
  }

  static async saveCampaign(env: Record<string, any>, influencerId: string, campaignId: string) {
    const db = getDb(env);
    const existing = await db
      .select()
      .from(schema.savedCampaigns)
      .where(and(eq(schema.savedCampaigns.influencerId, influencerId), eq(schema.savedCampaigns.campaignId, campaignId)))
      .get();
    if (existing) return { alreadySaved: true };
    const id = crypto.randomUUID();
    await db.insert(schema.savedCampaigns).values({ id, influencerId, campaignId });
    return { id, influencerId, campaignId };
  }

  static async unsaveCampaign(env: Record<string, any>, influencerId: string, campaignId: string) {
    const db = getDb(env);
    await db
      .delete(schema.savedCampaigns)
      .where(and(eq(schema.savedCampaigns.influencerId, influencerId), eq(schema.savedCampaigns.campaignId, campaignId)));
    return { success: true };
  }

  static async getSavedCampaigns(env: Record<string, any>, influencerId: string) {
    const db = getDb(env);
    return db
      .select({
        savedId: schema.savedCampaigns.id,
        id: schema.campaigns.id,
        title: schema.campaigns.title,
        budget: schema.campaigns.budget,
        campaignType: schema.campaigns.campaignType,
        status: schema.campaigns.status,
        createdAt: schema.campaigns.createdAt,
        brandName: schema.brandProfiles.companyName,
        brandLogo: schema.brandProfiles.logo,
      })
      .from(schema.savedCampaigns)
      .innerJoin(schema.campaigns, eq(schema.savedCampaigns.campaignId, schema.campaigns.id))
      .innerJoin(schema.brandProfiles, eq(schema.campaigns.brandId, schema.brandProfiles.userId))
      .where(eq(schema.savedCampaigns.influencerId, influencerId));
  }

  static async applyToCampaign(
    env: Record<string, any>,
    influencerId: string,
    campaignId: string,
    proposal: string,
    influencerAccountId?: string
  ) {
    const db = getDb(env);

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
      influencerAccountId: influencerAccountId || null,
      proposal,
      status: "pending" as const,
      createdAt: new Date(),
    };

    await db.insert(schema.campaignApplications).values(application);

    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: campaign.brandId,
      title: "New Campaign Application",
      message: `An influencer applied to your campaign "${campaign.title}"`,
      read: false,
      createdAt: new Date(),
    });

    return application;
  }

  static async getCampaigns(env: Record<string, any>, influencerId: string) {
    const db = getDb(env);

    // Fetch applications
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
        brandName: schema.brandProfiles.companyName,
        brandLogo: schema.brandProfiles.logo,
        instagramHandle: sql<string>`COALESCE(${schema.influencerAccounts.instagramHandle}, ${schema.influencerProfiles.instagramHandle})`.as("instagram_handle"),
      })
      .from(schema.campaignApplications)
      .innerJoin(schema.campaigns, eq(schema.campaignApplications.campaignId, schema.campaigns.id))
      .innerJoin(schema.brandProfiles, eq(schema.campaigns.brandId, schema.brandProfiles.userId))
      .innerJoin(schema.influencerProfiles, eq(schema.campaignApplications.influencerId, schema.influencerProfiles.userId))
      .leftJoin(schema.influencerAccounts, eq(schema.campaignApplications.influencerAccountId, schema.influencerAccounts.id))
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
        brandName: schema.brandProfiles.companyName,
        brandLogo: schema.brandProfiles.logo,
      })
      .from(schema.campaignInvites)
      .innerJoin(schema.campaigns, eq(schema.campaignInvites.campaignId, schema.campaigns.id))
      .innerJoin(schema.brandProfiles, eq(schema.campaigns.brandId, schema.brandProfiles.userId))
      .where(eq(schema.campaignInvites.influencerId, influencerId));

    return { applications, invites };
  }

  static async getDashboardData(env: Record<string, any>, userId: string) {
    const db = getDb(env);

    const earningsSum = await db
      .select({ total: sql<number>`sum(${schema.earnings.amount})` })
      .from(schema.earnings)
      .where(and(eq(schema.earnings.influencerId, userId), eq(schema.earnings.status, "cleared")))
      .get();

    const activeCampaigns = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.campaignApplications)
      .where(and(eq(schema.campaignApplications.influencerId, userId), eq(schema.campaignApplications.status, "accepted")))
      .get();

    const pendingApps = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.campaignApplications)
      .where(and(eq(schema.campaignApplications.influencerId, userId), eq(schema.campaignApplications.status, "pending")))
      .get();

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
