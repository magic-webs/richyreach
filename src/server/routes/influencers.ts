import { Hono } from "hono";
import { InfluencerController } from "../controllers/influencer.controller";
import { InfluencerAccountsController } from "../controllers/influencer-accounts.controller";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { rateLimiter } from "../middlewares/rateLimiter";
import { HonoEnv } from "../types";

const influencerRouter = new Hono<HonoEnv>()
  // ── Public ──────────────────────────────────────────────────────
  .get("/", rateLimiter({ windowMs: 60000, max: 60 }), InfluencerController.getInfluencers)

  // ── Auth required (any role can browse influencer marketplace data)
  .use("/marketplace-campaigns", requireAuth())
  .get("/marketplace-campaigns", requireRole(["influencer"]), InfluencerController.getMarketplaceCampaigns)

  .use("/saved-campaigns", requireAuth())
  .get("/saved-campaigns", requireRole(["influencer"]), InfluencerController.getSavedCampaigns)

  .use("/save-campaign", requireAuth())
  .post("/save-campaign", requireRole(["influencer"]), InfluencerController.saveCampaign)
  .delete("/save-campaign/:campaignId", requireAuth(), requireRole(["influencer"]), InfluencerController.unsaveCampaign)

  // ── Multi-account sub-routes ─────────────────────────────────────
  .use("/accounts", requireAuth())
  .get("/accounts", requireRole(["influencer"]), InfluencerAccountsController.listAccounts)
  .post("/accounts", requireRole(["influencer"]), InfluencerAccountsController.addAccount)

  .use("/accounts/:id", requireAuth())
  .put("/accounts/:id", requireRole(["influencer"]), InfluencerAccountsController.updateAccount)
  .delete("/accounts/:id", requireRole(["influencer"]), InfluencerAccountsController.deleteAccount)

  // ── Influencer-only routes ───────────────────────────────────────
  .use("/profile", requireAuth())
  .post("/profile", requireRole(["influencer"]), InfluencerController.createOrUpdateProfile)
  .put("/profile", requireRole(["influencer"]), InfluencerController.createOrUpdateProfile)

  .use("/sync-instagram", requireAuth())
  .post("/sync-instagram", requireRole(["influencer"]), InfluencerController.syncInstagram)

  .use("/dashboard", requireAuth())
  .get("/dashboard", requireRole(["influencer"]), InfluencerController.getDashboard)

  .use("/campaigns", requireAuth())
  .get("/campaigns", requireRole(["influencer"]), InfluencerController.getCampaigns)

  .use("/apply/:campaignId", requireAuth())
  .post("/apply/:campaignId", requireRole(["influencer"]), InfluencerController.applyCampaign)

  .use("/earnings", requireAuth())
  .get("/earnings", requireRole(["influencer"]), InfluencerController.getEarnings)

  .use("/analytics", requireAuth())
  .get("/analytics", requireRole(["influencer"]), InfluencerController.getAnalytics)

  // ── Public profile lookup by id (brand needs this for marketplace) ─
  // Keep this LAST — wildcard /:id must come after all named paths
  .get("/:id", InfluencerController.getInfluencerById);

export default influencerRouter;
