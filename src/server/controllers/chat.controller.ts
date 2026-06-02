import { Context } from "hono";
import { ChatService } from "../services/chat.service";
import { createRoomSchema, sendMessageSchema } from "../validators/chat";
import { sendSuccess, sendError } from "../utils/response";
import { HonoEnv } from "../types";

export class ChatController {
  static async getRooms(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const rooms = await ChatService.getRooms(c.env, user.id, user.role);
      return sendSuccess(c, rooms, "Chat rooms fetched successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch chat rooms", 500);
    }
  }

  static async createRoom(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      const validation = createRoomSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const room = await ChatService.createRoom(c.env, user.id, validation.data.influencerId, validation.data.campaignId);
      return sendSuccess(c, room, "Chat room created successfully", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to create chat room", 500);
    }
  }

  static async createAdminRoom(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user || user.role !== "admin") return sendError(c, "Unauthorized", 401);

      const body = await c.req.json();
      if (!body.userId) {
        return sendError(c, "userId is required", 400);
      }

      const room = await ChatService.createAdminRoom(c.env, body.userId);
      return sendSuccess(c, room, "Admin chat room created successfully", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to create admin chat room", 500);
    }
  }

  static async getMessages(c: Context<HonoEnv>) {
    try {
      const roomId = c.req.param("roomId") || "";
      const messages = await ChatService.getMessages(c.env, roomId);
      return sendSuccess(c, messages, "Messages fetched successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch messages", 500);
    }
  }

  static async sendMessage(c: Context<HonoEnv>) {
    try {
      const user = c.get("user");
      if (!user) return sendError(c, "Unauthorized", 401);

      const roomId = c.req.param("roomId") || "";
      const body = await c.req.json();
      const validation = sendMessageSchema.safeParse(body);

      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const message = await ChatService.createMessage(
        c.env,
        roomId,
        user.id,
        validation.data.content
      );

      return sendSuccess(c, message, "Message sent successfully", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to send message", 500);
    }
  }
}
