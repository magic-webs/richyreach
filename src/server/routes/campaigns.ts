import { Hono } from "hono";
import { BrandController } from "../controllers/brand.controller";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { HonoEnv } from "../types";

const campaignRouter = new Hono<HonoEnv>()
  .use("*", requireAuth())
  .use("*", requireRole(["brand"]))
  .post("/create", BrandController.createCampaign)
  .post("/advanced", BrandController.createCampaign) // Advanced/AI matching campaign creation
  .put("/:id", BrandController.updateCampaign)
  .delete("/:id", BrandController.deleteCampaign)
  .get("/", BrandController.getCampaigns)
  .get("/:id", BrandController.getCampaignById)
  .post("/invite", BrandController.inviteInfluencer);

export default campaignRouter;
