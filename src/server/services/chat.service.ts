import { eq, or, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";

export class ChatService {
  static async getRooms(env: Record<string, any>, userId: string, role: "influencer" | "brand" | "admin") {
    const db = getDb(env);

    if (role === "influencer") {
      return db
        .select({
          roomId: schema.chatRooms.id,
          createdAt: schema.chatRooms.createdAt,
          brandId: schema.brandProfiles.userId,
          companyName: schema.brandProfiles.companyName,
          logo: schema.brandProfiles.logo,
        })
        .from(schema.chatRooms)
        .innerJoin(schema.brandProfiles, eq(schema.chatRooms.brandId, schema.brandProfiles.userId))
        .where(eq(schema.chatRooms.influencerId, userId))
        .orderBy(desc(schema.chatRooms.createdAt));
    } else {
      return db
        .select({
          roomId: schema.chatRooms.id,
          createdAt: schema.chatRooms.createdAt,
          influencerId: schema.influencerProfiles.userId,
          instagramHandle: schema.influencerProfiles.instagramHandle,
          avatar: schema.users.image,
          name: schema.users.name,
        })
        .from(schema.chatRooms)
        .innerJoin(schema.influencerProfiles, eq(schema.chatRooms.influencerId, schema.influencerProfiles.userId))
        .innerJoin(schema.users, eq(schema.influencerProfiles.userId, schema.users.id))
        .where(eq(schema.chatRooms.brandId, userId))
        .orderBy(desc(schema.chatRooms.createdAt));
    }
  }

  static async createRoom(
    env: Record<string, any>,
    brandId: string,
    influencerId: string
  ) {
    const db = getDb(env);

    // Check if room already exists
    const existing = await db
      .select()
      .from(schema.chatRooms)
      .where(and(eq(schema.chatRooms.brandId, brandId), eq(schema.chatRooms.influencerId, influencerId)))
      .get();

    if (existing) return existing;

    const roomId = crypto.randomUUID();
    const newRoom = {
      id: roomId,
      brandId,
      influencerId,
      createdAt: new Date(),
    };

    await db.insert(schema.chatRooms).values(newRoom);
    return newRoom;
  }

  static async getMessages(env: Record<string, any>, roomId: string) {
    const db = getDb(env);

    return db
      .select({
        id: schema.messages.id,
        content: schema.messages.content,
        createdAt: schema.messages.createdAt,
        senderId: schema.messages.senderId,
        senderName: schema.users.name,
        senderAvatar: schema.users.image,
      })
      .from(schema.messages)
      .innerJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
      .where(eq(schema.messages.roomId, roomId))
      .orderBy(schema.messages.createdAt);
  }

  static async createMessage(
    env: Record<string, any>,
    roomId: string,
    senderId: string,
    content: string
  ) {
    const db = getDb(env);

    // Verify room exists
    const room = await db
      .select()
      .from(schema.chatRooms)
      .where(eq(schema.chatRooms.id, roomId))
      .get();

    if (!room) {
      throw new Error("Chat room not found");
    }

    const messageId = crypto.randomUUID();
    const message = {
      id: messageId,
      roomId,
      senderId,
      content,
      createdAt: new Date(),
    };

    await db.insert(schema.messages).values(message);
    
    // Determine recipient
    const recipientId = senderId === room.brandId ? room.influencerId : room.brandId;
    
    // Trigger Real-time structural notifications
    await db.insert(schema.notifications).values({
      id: crypto.randomUUID(),
      userId: recipientId,
      title: "New Message",
      message: `You received a message in your chat room: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
      read: false,
      createdAt: new Date(),
    });

    return message;
  }
}
