import { eq, or, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";

export class ChatService {
  static async getRooms(env: Record<string, any>, userId: string, role: "influencer" | "brand" | "admin") {
    const db = getDb(env);

    if (role === "admin") {
      const adminRoomsRaw = await db
        .select({
          room: schema.adminChats,
          user: schema.users,
        })
        .from(schema.adminChats)
        .innerJoin(schema.users, eq(schema.adminChats.userId, schema.users.id))
        .orderBy(desc(schema.adminChats.createdAt));

      return adminRoomsRaw.map(({ room, user }) => ({
        roomId: `admin_${room.id}`,
        createdAt: room.createdAt,
        userId: user.id,
        name: user.name,
        role: user.role,
        avatar: user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      }));
    }

    if (role === "influencer") {
      const regularRooms = await db
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

      const adminRoomsRaw = await db.select().from(schema.adminChats).where(eq(schema.adminChats.userId, userId)).all();
      const adminRooms = adminRoomsRaw.map((room) => ({
        roomId: `admin_${room.id}`,
        createdAt: room.createdAt,
        brandId: room.userId,
        companyName: "RichyReach Team",
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=RichyReach",
      }));

      return [...regularRooms, ...adminRooms].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      const regularRooms = await db
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

      const adminRoomsRaw = await db.select().from(schema.adminChats).where(eq(schema.adminChats.userId, userId)).all();
      const adminRooms = adminRoomsRaw.map((room) => ({
        roomId: `admin_${room.id}`,
        createdAt: room.createdAt,
        influencerId: room.userId, // mock alias
        instagramHandle: "RichyReachTeam",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RichyReach",
        name: "RichyReach Team",
      }));

      return [...regularRooms, ...adminRooms].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  static async createRoom(
    env: Record<string, any>,
    brandId: string,
    influencerId: string,
    campaignId?: string
  ) {
    const db = getDb(env);

    // Check if room already exists
    const existing = await db
      .select()
      .from(schema.chatRooms)
      .where(and(eq(schema.chatRooms.brandId, brandId), eq(schema.chatRooms.influencerId, influencerId)))
      .get();

    if (existing) {
      if (campaignId) {
        await db
          .update(schema.campaignApplications)
          .set({ status: "accepted" })
          .where(
            and(
              eq(schema.campaignApplications.campaignId, campaignId),
              eq(schema.campaignApplications.influencerId, influencerId)
            )
          )
          .run();
      }
      return existing;
    }

    const roomId = crypto.randomUUID();
    const newRoom = {
      id: roomId,
      brandId,
      influencerId,
      createdAt: new Date(),
    };

    await db.insert(schema.chatRooms).values(newRoom).run();

    if (campaignId) {
      await db
        .update(schema.campaignApplications)
        .set({ status: "accepted" })
        .where(
          and(
            eq(schema.campaignApplications.campaignId, campaignId),
            eq(schema.campaignApplications.influencerId, influencerId)
          )
        )
        .run();
    }
    
    return newRoom;
  }

  static async createAdminRoom(env: Record<string, any>, userId: string) {
    const db = getDb(env);
    const existing = await db
      .select()
      .from(schema.adminChats)
      .where(eq(schema.adminChats.userId, userId))
      .get();

    if (existing) {
      return { ...existing, roomId: `admin_${existing.id}` };
    }

    const roomId = crypto.randomUUID();
    const newRoom = {
      id: roomId,
      userId,
      createdAt: new Date(),
    };

    await db.insert(schema.adminChats).values(newRoom).run();
    return { ...newRoom, roomId: `admin_${roomId}` };
  }

  static async getMessages(env: Record<string, any>, roomId: string) {
    const db = getDb(env);

    if (roomId.startsWith("admin_")) {
      const actualRoomId = roomId.replace("admin_", "");
      return db
        .select({
          id: schema.adminMessages.id,
          content: schema.adminMessages.content,
          createdAt: schema.adminMessages.createdAt,
          senderId: schema.adminMessages.senderId,
          senderName: schema.users.name,
          senderAvatar: schema.users.image,
        })
        .from(schema.adminMessages)
        .innerJoin(schema.users, eq(schema.adminMessages.senderId, schema.users.id))
        .where(eq(schema.adminMessages.chatId, actualRoomId))
        .orderBy(schema.adminMessages.createdAt);
    }

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

    if (roomId.startsWith("admin_")) {
      const actualRoomId = roomId.replace("admin_", "");
      const room = await db
        .select()
        .from(schema.adminChats)
        .where(eq(schema.adminChats.id, actualRoomId))
        .get();

      if (!room) {
        throw new Error("Admin Chat room not found");
      }

      const messageId = crypto.randomUUID();
      const message = {
        id: messageId,
        chatId: actualRoomId,
        senderId,
        content,
        createdAt: new Date(),
      };

      await db.insert(schema.adminMessages).values(message);

      const sender = await db.select().from(schema.users).where(eq(schema.users.id, senderId)).get();
      
      // Determine recipient (Admin Notification)
      if (sender?.role === "admin") {
        await db.insert(schema.notifications).values({
          id: crypto.randomUUID(),
          userId: room.userId,
          title: "Message from RichyReach Team",
          message: `RichyReach Team: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
          read: false,
          createdAt: new Date(),
        });
      } else {
        // notify admins
        const admins = await db.select().from(schema.users).where(eq(schema.users.role, "admin")).all();
        for (const admin of admins) {
          await db.insert(schema.notifications).values({
            id: crypto.randomUUID(),
            userId: admin.id,
            title: "Support Reply",
            message: `${sender?.name} sent a message: "${content.slice(0, 30)}${content.length > 30 ? "..." : ""}"`,
            read: false,
            createdAt: new Date(),
          });
        }
      }

      return message;
    }

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
