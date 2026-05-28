import { MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";
import { sendError } from "../utils/response";
import { getCookie } from "hono/cookie";

import { getDb } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth";

export const requireAuth = (): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    try {
      // 1. Try Better Auth first
      const bSession = await auth.api.getSession({ headers: c.req.raw.headers });
      if (bSession && bSession.user) {
        c.set("user", {
          id: bSession.user.id,
          name: bSession.user.name,
          email: bSession.user.email,
          role: (bSession.user as any).role || "influencer",
        });
        return await next();
      }

      const db = getDb(c.env);
      const authHeader = c.req.header("Authorization");
      let token = getCookie(c, "reelio_session");

      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }

      if (!token) {
        return sendError(c, "Unauthorized. Authentication is required to access this endpoint.", 401);
      }


      // 1. Fallback for easier development testing (mock tokens)
      if (token.startsWith("mock-")) {
        const mockRole = token.replace("mock-", "") as "influencer" | "brand" | "admin";
        const mockId = `mock_${mockRole}_id`;
        
        // Ensure mock user exists in the database
        try {
          const existingUser = await db.select().from(schema.users).where(eq(schema.users.id, mockId)).get();
          if (!existingUser) {
            await db.insert(schema.users).values({
              id: mockId,
              name: `Mock ${mockRole.charAt(0).toUpperCase() + mockRole.slice(1)}`,
              email: `${mockRole}@reelio-mock.com`,
              role: mockRole,
              image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${mockRole}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            // Seed a default profile for the mock user to prevent relation queries from breaking
            if (mockRole === "influencer") {
              await db.insert(schema.influencerProfiles).values({
                userId: mockId,
                instagramHandle: `mock_influencer_ig`,
                followers: 52000,
                engagementRate: 4.8,
                niche: "Lifestyle",
                pricing: 12000,
                avgViews: 85000,
                avgLikes: 2496,
                verified: true,
                level: "mid",
                reachScore: 62,
                country: "India",
                postingFrequency: 5.0,
                growthRate: 3.2,
              });

            } else if (mockRole === "brand") {
              await db.insert(schema.brandProfiles).values({
                userId: mockId,
                companyName: "Mock Brand Co.",
                website: "https://richyreach.com",
                category: "Fashion",
                description: "Mock brand account for developer testing.",
              });
            }
          }
        } catch (e) {
          console.error("Failed to auto-seed mock user:", e);
        }

        c.set("user", {
          id: mockId,
          name: `Mock ${mockRole.charAt(0).toUpperCase() + mockRole.slice(1)}`,
          email: `${mockRole}@richyreach-mock.com`,
          role: mockRole,
        });
        return await next();
      }

      // 2. Query real session from DB
      const session = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.token, token))
        .get();

      if (!session || session.expiresAt < new Date()) {
        if (session) {
          // Clean up expired session asynchronously
          db.delete(schema.sessions).where(eq(schema.sessions.id, session.id)).run();
        }
        return sendError(c, "Unauthorized. Session is invalid or expired.", 401);
      }

      // 3. Fetch user
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, session.userId))
        .get();

      if (!user) {
        return sendError(c, "Unauthorized. User record not found.", 401);
      }

      c.set("user", {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      await next();
    } catch (error: any) {
      return sendError(c, `Authentication Error: ${error.message || error}`, 401);
    }
  };
};
