import { Hono } from "hono";
import { NotificationController } from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth";
import { HonoEnv } from "../types";

const notificationRouter = new Hono<HonoEnv>()
  .use("*", requireAuth())
  .get("/", NotificationController.getNotifications)
  .put("/read", NotificationController.markRead);

export default notificationRouter;
