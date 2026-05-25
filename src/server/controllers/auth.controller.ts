import { Context } from "hono";
import { eq } from "drizzle-orm";
import { getAuth } from "../auth";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { signUpSchema, loginSchema } from "../validators/auth";
import { sendSuccess, sendError } from "../utils/response";

export class AuthController {
  // Better Auth catch-all API handler (for social redirects, OAuth callbacks, etc.)
  static async handleAuth(c: Context) {
    const auth = getAuth(c.env);
    return auth.handler(c.req.raw);
  }

  static async signUp(c: Context) {
    try {
      const body = await c.req.json();
      const validation = signUpSchema.safeParse(body);
      
      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const { email, password, name, role } = validation.data;
      const auth = getAuth(c.env);

      // Sign up without passing 'role' to avoid Better Auth core type checks
      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: c.req.raw.headers,
      });

      // Update role directly in user table using Drizzle
      if (result && result.user) {
        const db = getDb(c.env);
        await db
          .update(schema.users)
          .set({ role })
          .where(eq(schema.users.id, result.user.id));
        
        // Attach the role back to the response user object
        (result.user as any).role = role;
      }

      return sendSuccess(c, result, "User registered successfully", 201);
    } catch (error: any) {
      return sendError(c, error.message || "Failed to sign up", 400);
    }
  }

  static async login(c: Context) {
    try {
      const body = await c.req.json();
      const validation = loginSchema.safeParse(body);
      
      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const { email, password } = validation.data;
      const auth = getAuth(c.env);

      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
        headers: c.req.raw.headers,
      });

      return sendSuccess(c, result, "Login successful");
    } catch (error: any) {
      return sendError(c, error.message || "Invalid credentials", 400);
    }
  }

  static async logout(c: Context) {
    try {
      const auth = getAuth(c.env);
      await auth.api.signOut({
        headers: c.req.raw.headers,
      });
      return sendSuccess(c, null, "Logged out successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to log out", 500);
    }
  }

  static async getSession(c: Context) {
    try {
      const auth = getAuth(c.env);
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session) {
        return sendError(c, "No active session", 401);
      }

      return sendSuccess(c, session, "Active session retrieved");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to fetch session", 500);
    }
  }
}
