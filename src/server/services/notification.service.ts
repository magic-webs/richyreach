import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";

export class NotificationService {
  static async getNotifications(env: Record<string, any>, userId: string) {
    const db = getDb(env);

    return db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));
  }

  static async markRead(env: Record<string, any>, userId: string, notificationId: string) {
    const db = getDb(env);

    if (notificationId === "all") {
      await db
        .update(schema.notifications)
        .set({ read: true })
        .where(eq(schema.notifications.userId, userId));
      return { success: true };
    }

    await db
      .update(schema.notifications)
      .set({ read: true })
      .where(and(eq(schema.notifications.id, notificationId), eq(schema.notifications.userId, userId)));

    return { success: true };
  }
}
