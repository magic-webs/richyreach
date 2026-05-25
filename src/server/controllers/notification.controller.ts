import { Context } from "hono";
import { NotificationService } from "../services/notification.service";
import { sendSuccess, sendError } from "../utils/response";
import { HonoEnv } from "../types";

export class NotificationController {
  static async getNotifications(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const items = await NotificationService.getNotifications(c.env, user.id);
      return sendSuccess(c, items, "Notifications retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch notifications", 500);
    }
  }

  static async markRead(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const id = c.req.query("id") || "all";
      await NotificationService.markRead(c.env, user.id, id);
      
      return sendSuccess(c, null, "Notifications marked as read successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to mark notifications as read", 500);
    }
  }
}
