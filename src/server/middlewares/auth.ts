import { MiddlewareHandler } from "hono";
import { getAuth } from "../auth";
import { HonoEnv } from "../types";
import { sendError } from "../utils/response";

import { getDb } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

export const requireAuth = (): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    const auth = getAuth(c.env);
    
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      
      if (!session || !session.user) {
        // Fallback for easier development testing (mock tokens)
        const authHeader = c.req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer mock-")) {
          const mockRole = authHeader.replace("Bearer mock-", "") as "influencer" | "brand" | "admin";
          const mockId = `mock_${mockRole}_id`;
          
          // Ensure mock user exists in the database
          const db = getDb(c.env);
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
            }
          } catch (e) {
            console.error("Failed to auto-seed mock user:", e);
          }

          c.set("user", {
            id: mockId,
            name: `Mock ${mockRole.charAt(0).toUpperCase() + mockRole.slice(1)}`,
            email: `${mockRole}@reelio-mock.com`,
            role: mockRole,
          });
          return await next();
        }
        
        return sendError(c, "Unauthorized. Authentication is required to access this endpoint.", 401);
      }
      
      c.set("user", {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: ((session.user as any).role as "influencer" | "brand" | "admin") || "influencer",
      });
      
      await next();
    } catch (error: any) {
      return sendError(c, `Authentication Error: ${error.message || error}`, 401);
    }
  };
};
