import { Hono } from "hono";
import { BrandController } from "../controllers/brand.controller";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { HonoEnv } from "../types";

const brandRouter = new Hono<HonoEnv>()
  .use("*", requireAuth())
  .use("*", requireRole(["brand"]))
  .post("/profile", BrandController.createOrUpdateProfile)
  .put("/profile", BrandController.createOrUpdateProfile)
  .get("/profile", BrandController.getProfile)
  .get("/dashboard", BrandController.getDashboard)
  // Saved influencers
  .get("/saved-influencers", BrandController.getSavedInfluencers)
  .post("/save-influencer", BrandController.saveInfluencer)
  .delete("/save-influencer/:influencerId", BrandController.unsaveInfluencer);

export default brandRouter;
