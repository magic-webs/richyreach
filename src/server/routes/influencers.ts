import { Hono } from "hono";
import { InfluencerController } from "../controllers/influencer.controller";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { rateLimiter } from "../middlewares/rateLimiter";
import { HonoEnv } from "../types";

const influencerRouter = new Hono<HonoEnv>()
  .get("/", rateLimiter({ windowMs: 60000, max: 60 }), InfluencerController.getInfluencers)
  .get("/:id", InfluencerController.getInfluencerById)
  
  // Protected influencer-only routes
  .use("*", requireAuth())
  .use("*", requireRole(["influencer"]))
  .post("/profile", InfluencerController.createOrUpdateProfile)
  .put("/profile", InfluencerController.createOrUpdateProfile)
  .get("/dashboard", InfluencerController.getDashboard)
  .get("/campaigns", InfluencerController.getCampaigns)
  .post("/apply/:campaignId", InfluencerController.applyCampaign)
  .get("/earnings", InfluencerController.getEarnings)
  .get("/analytics", InfluencerController.getAnalytics);

export default influencerRouter;
