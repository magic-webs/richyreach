import { Hono } from "hono";
import { AdminController } from "../controllers/admin.controller";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { HonoEnv } from "../types";

const adminRouter = new Hono<HonoEnv>()
  .use("*", requireAuth())
  .use("*", requireRole(["admin"]))
  .get("/users", AdminController.getUsers)
  .get("/campaigns", AdminController.getCampaigns)
  .get("/reports", AdminController.getReports)
  .delete("/user/:id", AdminController.deleteUser)
  // Profile verification queue
  .get("/pending-profiles", AdminController.getPendingProfiles)
  .post("/verify-profile", AdminController.verifyProfile);

export default adminRouter;

