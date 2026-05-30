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
