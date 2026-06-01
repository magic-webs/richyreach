import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. Better Auth Tables
// ==========================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role").$type<"influencer" | "brand" | "admin">().notNull().default("influencer"),
  bio: text("bio"),
  walletBalance: integer("wallet_balance").notNull().default(50000), // Default welcome bonus of 500 INR (50000 paise)
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  password: text("password"),
  scope: text("scope"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const otps = sqliteTable("otps", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  code: text("code").notNull(),
  method: text("method").$type<"email" | "whatsapp">().notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});


// ==========================================
// 2. Profiles Tables
// ==========================================

export const influencerProfiles = sqliteTable("influencer_profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  instagramHandle: text("instagram_handle").notNull().unique(),
  followers: integer("followers").notNull().default(0),
  engagementRate: real("engagement_rate").notNull().default(0),
  niche: text("niche").notNull(),
  avgViews: integer("avg_views").notNull().default(0),
  avgLikes: integer("avg_likes").notNull().default(0),
  pricing: integer("pricing").notNull().default(0), // Price per post/reel in USD cents
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  level: text("level").$type<"nano" | "micro" | "mid" | "macro" | "mega">().notNull().default("nano"),
  // Extended fields
  reachScore: real("reach_score").notNull().default(0), // 0-100 computed score
  country: text("country"),
  socialLinks: text("social_links"), // JSON: { twitter, tiktok, youtube, website }
  audienceDemographics: text("audience_demographics"), // JSON: { ageGroups, genders, topCountries }
  postingFrequency: real("posting_frequency").notNull().default(0), // posts per week
  growthRate: real("growth_rate").notNull().default(0), // % monthly
});

export const brandProfiles = sqliteTable("brand_profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  website: text("website").notNull(),
  logo: text("logo"),
  category: text("category").notNull(),
  description: text("description"),
  // Extended fields
  instagramPage: text("instagram_page"),
  brandSize: text("brand_size").$type<"startup" | "smb" | "enterprise">().default("smb"),
  budgetRange: text("budget_range").$type<"low" | "mid" | "high" | "enterprise">().default("mid"),
  socialLinks: text("social_links"), // JSON: { twitter, linkedin, tiktok }
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
});

// ──────────────────────────────────────────────
// Multi-profile Sub-accounts
// ──────────────────────────────────────────────

// Extra Instagram accounts per influencer (manually added, admin-verified)
export const influencerAccounts = sqliteTable("influencer_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Instagram identity
  instagramHandle: text("instagram_handle").notNull().unique(),
  // Manually entered stats
  followers: integer("followers").notNull().default(0),
  engagementRate: real("engagement_rate").notNull().default(0),
  avgViews: integer("avg_views").notNull().default(0),
  avgLikes: integer("avg_likes").notNull().default(0),
  niche: text("niche").notNull().default("Lifestyle"),
  pricing: integer("pricing").notNull().default(0), // USD cents per post
  level: text("level").$type<"nano" | "micro" | "mid" | "macro" | "mega">().notNull().default("nano"),
  country: text("country"),
  bio: text("bio"),
  // Verification
  status: text("status").$type<"pending" | "verified" | "rejected">().notNull().default("pending"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  verifiedBy: text("verified_by").references(() => users.id),
  verificationNote: text("verification_note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Extra brand profiles per brand user (manually added, admin-verified)
export const brandAccounts = sqliteTable("brand_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Brand identity
  companyName: text("company_name").notNull(),
  website: text("website").notNull().default(""),
  logo: text("logo"),
  category: text("category").notNull().default("General"),
  description: text("description"),
  instagramPage: text("instagram_page"),
  brandSize: text("brand_size").$type<"startup" | "smb" | "enterprise">().default("smb"),
  budgetRange: text("budget_range").$type<"low" | "mid" | "high" | "enterprise">().default("mid"),
  // Verification
  status: text("status").$type<"pending" | "verified" | "rejected">().notNull().default("pending"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  verifiedBy: text("verified_by").references(() => users.id),
  verificationNote: text("verification_note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const creatorSkills = sqliteTable("creator_skills", {
  id: text("id").primaryKey(),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  skill: text("skill").notNull(),
});

export const creatorPortfolio = sqliteTable("creator_portfolio", {
  id: text("id").primaryKey(),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").$type<"image" | "video">().notNull(),
  title: text("title"),
  description: text("description"),
});

// ==========================================
// 2b. New Profile Support Tables
// ==========================================

export const reachScores = sqliteTable("reach_scores", {
  id: text("id").primaryKey(),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  score: real("score").notNull(),
  // JSON breakdown: { followers, engagement, consistency, audienceQuality, growth, recentPerformance }
  breakdown: text("breakdown"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const savedInfluencers = sqliteTable("saved_influencers", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.userId, { onDelete: "cascade" }),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const audienceData = sqliteTable("audience_data", {
  id: text("id").primaryKey(),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  ageGroup: text("age_group").notNull(), // e.g. "18-24", "25-34"
  percentage: real("percentage").notNull(),
  gender: text("gender"), // "male" | "female" | "other"
  country: text("country"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// 3. Campaign & Applications Tables
// ==========================================

export const campaigns = sqliteTable("campaigns", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.userId, { onDelete: "cascade" }),
  // Optional: which brand sub-account is posting this campaign
  brandAccountId: text("brand_account_id").references(() => brandAccounts.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: integer("budget").notNull(), // Budget in USD cents
  campaignType: text("campaign_type").notNull(), // e.g. "story", "reel", "post", "long-term"
  allowFraction: integer("allow_fraction", { mode: "boolean" }).notNull().default(false),
  targetAudience: text("target_audience"),
  requirements: text("requirements"),
  status: text("status").$type<"draft" | "active" | "completed" | "cancelled">().notNull().default("draft"),
  expectedReach: integer("expected_reach").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const campaignApplications = sqliteTable("campaign_applications", {
  id: text("id").primaryKey(),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  // Optional: which influencer sub-account is applying
  influencerAccountId: text("influencer_account_id").references(() => influencerAccounts.id, { onDelete: "set null" }),
  proposal: text("proposal").notNull(),
  status: text("status").$type<"pending" | "accepted" | "rejected">().notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const campaignInvites = sqliteTable("campaign_invites", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.userId, { onDelete: "cascade" }),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  status: text("status").$type<"pending" | "accepted" | "declined">().notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const savedCampaigns = sqliteTable("saved_campaigns", {
  id: text("id").primaryKey(),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const contracts = sqliteTable("contracts", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  brandId: text("brand_id").notNull().references(() => brandProfiles.userId, { onDelete: "cascade" }),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  terms: text("terms").notNull(),
  status: text("status").$type<"draft" | "signed" | "active" | "terminated">().notNull().default("draft"),
  signedAt: integer("signed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// 4. Tasks & Earnings Tables
// ==========================================

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  title: text("title").notNull(),
  rewardAmount: integer("reward_amount").notNull(), // in USD cents
  taskType: text("task_type").notNull(), // e.g. "story", "reel", "post"
  status: text("status").$type<"todo" | "in_progress" | "completed">().notNull().default("todo"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const earnings = sqliteTable("earnings", {
  id: text("id").primaryKey(),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in USD cents
  source: text("source").notNull(), // Campaign ID or Task ID
  status: text("status").$type<"pending" | "cleared">().notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// 5. Chat Tables
// ==========================================

export const chatRooms = sqliteTable("chat_rooms", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brandProfiles.userId, { onDelete: "cascade" }),
  influencerId: text("influencer_id").notNull().references(() => influencerProfiles.userId, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull().references(() => chatRooms.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// 6. Notifications & Reviews & Analytics
// ==========================================

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  reviewerId: text("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  revieweeId: text("reviewee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey(),
  entityId: text("entity_id").notNull(), // influencer userId, brand userId, or campaignId
  entityType: text("entity_type").$type<"influencer" | "campaign" | "brand">().notNull(),
  metricName: text("metric_name").notNull(), // e.g. "reach", "impressions", "clicks", "engagement", "views"
  metricValue: real("metric_value").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in USD cents
  status: text("status").notNull(), // "pending", "succeeded", "failed"
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const walletTransactions = sqliteTable("wallet_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in paise
  type: text("type").$type<"credit" | "debit">().notNull(),
  description: text("description"), // e.g. "Welcome Bonus", "Razorpay Deposit"
  reference: text("reference"), // e.g. Razorpay Payment ID or Order ID
  status: text("status").notNull().default("completed"), // "pending", "completed", "failed"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ==========================================
// Relations Definitions
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  influencerProfile: one(influencerProfiles, {
    fields: [users.id],
    references: [influencerProfiles.userId],
  }),
  brandProfile: one(brandProfiles, {
    fields: [users.id],
    references: [brandProfiles.userId],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  sentMessages: many(messages),
  notifications: many(notifications),
  walletTransactions: many(walletTransactions),
}));

export const influencerProfilesRelations = relations(influencerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [influencerProfiles.userId],
    references: [users.id],
  }),
  skills: many(creatorSkills),
  portfolioItems: many(creatorPortfolio),
  applications: many(campaignApplications),
  invites: many(campaignInvites),
  savedCampaigns: many(savedCampaigns),
  earnings: many(earnings),
  chatRooms: many(chatRooms),
  tasks: many(tasks),
  reachScores: many(reachScores),
  audienceData: many(audienceData),
  savedByBrands: many(savedInfluencers),
}));

export const brandProfilesRelations = relations(brandProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [brandProfiles.userId],
    references: [users.id],
  }),
  campaigns: many(campaigns),
  invites: many(campaignInvites),
  chatRooms: many(chatRooms),
  savedInfluencers: many(savedInfluencers),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  brand: one(brandProfiles, {
    fields: [campaigns.brandId],
    references: [brandProfiles.userId],
  }),
  applications: many(campaignApplications),
  invites: many(campaignInvites),
  tasks: many(tasks),
  payments: many(payments),
  contracts: many(contracts),
  reviews: many(reviews),
  savedBy: many(savedCampaigns),
}));

export const campaignApplicationsRelations = relations(campaignApplications, ({ one }) => ({
  influencer: one(influencerProfiles, {
    fields: [campaignApplications.influencerId],
    references: [influencerProfiles.userId],
  }),
  campaign: one(campaigns, {
    fields: [campaignApplications.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignInvitesRelations = relations(campaignInvites, ({ one }) => ({
  brand: one(brandProfiles, {
    fields: [campaignInvites.brandId],
    references: [brandProfiles.userId],
  }),
  influencer: one(influencerProfiles, {
    fields: [campaignInvites.influencerId],
    references: [influencerProfiles.userId],
  }),
  campaign: one(campaigns, {
    fields: [campaignInvites.campaignId],
    references: [campaigns.id],
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  brand: one(brandProfiles, {
    fields: [chatRooms.brandId],
    references: [brandProfiles.userId],
  }),
  influencer: one(influencerProfiles, {
    fields: [chatRooms.influencerId],
    references: [influencerProfiles.userId],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [messages.roomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [tasks.campaignId],
    references: [campaigns.id],
  }),
  influencer: one(influencerProfiles, {
    fields: [tasks.influencerId],
    references: [influencerProfiles.userId],
  }),
}));

export const earningsRelations = relations(earnings, ({ one }) => ({
  influencer: one(influencerProfiles, {
    fields: [earnings.influencerId],
    references: [influencerProfiles.userId],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const reachScoresRelations = relations(reachScores, ({ one }) => ({
  influencer: one(influencerProfiles, {
    fields: [reachScores.influencerId],
    references: [influencerProfiles.userId],
  }),
}));

export const savedInfluencersRelations = relations(savedInfluencers, ({ one }) => ({
  brand: one(brandProfiles, {
    fields: [savedInfluencers.brandId],
    references: [brandProfiles.userId],
  }),
  influencer: one(influencerProfiles, {
    fields: [savedInfluencers.influencerId],
    references: [influencerProfiles.userId],
  }),
}));

export const audienceDataRelations = relations(audienceData, ({ one }) => ({
  influencer: one(influencerProfiles, {
    fields: [audienceData.influencerId],
    references: [influencerProfiles.userId],
  }),
}));

export const savedCampaignsRelations = relations(savedCampaigns, ({ one }) => ({
  influencer: one(influencerProfiles, {
    fields: [savedCampaigns.influencerId],
    references: [influencerProfiles.userId],
  }),
  campaign: one(campaigns, {
    fields: [savedCampaigns.campaignId],
    references: [campaigns.id],
  }),
}));

// ── New sub-account relations ───────────────────────────────────

export const influencerAccountsRelations = relations(influencerAccounts, ({ one }) => ({
  user: one(users, {
    fields: [influencerAccounts.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [influencerAccounts.verifiedBy],
    references: [users.id],
    relationName: "influencerAccountVerifier",
  }),
}));

export const brandAccountsRelations = relations(brandAccounts, ({ one }) => ({
  user: one(users, {
    fields: [brandAccounts.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [brandAccounts.verifiedBy],
    references: [users.id],
    relationName: "brandAccountVerifier",
  }),
}));

