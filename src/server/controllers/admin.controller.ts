import { Context } from "hono";
import { AdminService } from "../services/admin.service";
import { sendSuccess, sendError } from "../utils/response";
import { HonoEnv } from "../types";

export class AdminController {
  static async getUsers(c: Context<HonoEnv>) {
    try {
      const users = await AdminService.getUsers(c.env);
      return sendSuccess(c, users, "Users list retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to retrieve users", 500);
    }
  }

  static async getCampaigns(c: Context<HonoEnv>) {
    try {
      const campaigns = await AdminService.getCampaigns(c.env);
      return sendSuccess(c, campaigns, "Campaigns list retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to retrieve campaigns", 500);
    }
  }

  static async getReports(c: Context<HonoEnv>) {
    try {
      const stats = await AdminService.getReports(c.env);
      return sendSuccess(c, stats, "Platform analytics report retrieved successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to compile reports", 500);
    }
  }

  static async deleteUser(c: Context<HonoEnv>) {
    try {
      const id = c.req.param("id") || "";
      await AdminService.deleteUser(c.env, id);
      return sendSuccess(c, null, "User account and all dependencies deleted successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to delete user", 500);
    }
  }
}
