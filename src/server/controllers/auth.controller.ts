import { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { requestOtpSchema, verifyOtpSchema } from "../validators/auth";
import { sendSuccess, sendError } from "../utils/response";
import { WhatsAppService } from "../services/whatsapp.service";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

export class AuthController {
  
  // Endpoint: POST /api/auth/request-otp
  static async requestOtp(c: Context) {
    try {
      const body = await c.req.json();
      const validation = requestOtpSchema.safeParse(body);
      
      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const { identifier, method, mode } = validation.data;
      const db = getDb(c.env);

      // If it's a login attempt, verify the user exists first
      if (mode === "login") {
        const existingUser = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, identifier.toLowerCase().trim()))
          .get();

        if (!existingUser) {
          return sendError(c, "Account not found. Please register first.", 404);
        }
      }

      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

      // Save OTP in the database
      const otpId = `otp_${crypto.randomUUID()}`;
      await db.insert(schema.otps).values({
        id: otpId,
        identifier: identifier.toLowerCase().trim(),
        code,
        method,
        expiresAt,
      });

      // Dispatch via chosen method
      if (method === "email") {
        const apiKey = c.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
        const fromEmail = c.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "Richy Reach Auth <auth@reelioo.magicxbot.com>";
        
        console.log(`\n==================================================`);
        console.log(`[EMAIL OTP] Sending code [ ${code} ] to [ ${identifier} ]`);
        console.log(`==================================================\n`);

        if (apiKey) {
          try {
            const resendResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: fromEmail,
                to: [identifier],
                subject: "Verify your Richy Reach Account",
                html: `
                  <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
                    <h2 style="color: #3F030B; margin-bottom: 16px; font-weight: 800;">Richy Reach Platform Verification</h2>
                    <p>Use the following one-time verification code to secure your login:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 16px 24px; background-color: #f3f4f6; text-align: center; border-radius: 12px; margin: 24px 0; color: #1e1b4b; font-family: monospace;">
                      ${code}
                    </div>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This verification code is active for 10 minutes. If you did not initiate this request, you can disregard this email safely.</p>
                  </div>
                `
              })
            });
            if (!resendResponse.ok) {
              const errBody = await resendResponse.text();
              console.error("[RESEND ERROR]", errBody);
            }
          } catch (err) {
            console.error("[RESEND EXCEPTION]", err);
          }
        } else {
          console.log("[RESEND SERVICE] RESEND_API_KEY missing. Mocked successfully.");
        }
      } else {
        // Send WhatsApp OTP
        await WhatsAppService.sendOtp(c.env, identifier, code);
      }

      return sendSuccess(c, { identifier, method }, "Verification OTP sent successfully");
    } catch (error: any) {
      console.error("[REQUEST OTP ERROR]", error);
      return sendError(c, error.message || "Failed to request verification code", 500);
    }
  }

  // Endpoint: POST /api/auth/verify-otp
  static async verifyOtp(c: Context) {
    try {
      const body = await c.req.json();
      const validation = verifyOtpSchema.safeParse(body);
      
      if (!validation.success) {
        return sendError(c, "Validation failed", 400, validation.error.format());
      }

      const { identifier, code, role, name } = validation.data;
      const db = getDb(c.env);
      const normalizedIdentifier = identifier.toLowerCase().trim();

      // Find the most recent unexpired matching OTP code
      const now = new Date();
      const matchingOtps = await db
        .select()
        .from(schema.otps)
        .where(
          and(
            eq(schema.otps.identifier, normalizedIdentifier),
            eq(schema.otps.code, code)
          )
        )
        .orderBy(desc(schema.otps.createdAt))
        .all();

      const validOtp = matchingOtps.find(otp => otp.expiresAt > now);

      if (!validOtp) {
        return sendError(c, "Invalid or expired verification code", 400);
      }

      // Code matched! Delete this OTP code so it cannot be used again
      await db.delete(schema.otps).where(eq(schema.otps.id, validOtp.id));

      // Check if user already exists
      let user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, normalizedIdentifier))
        .get();

      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        // Require role for new users
        const finalRole = role || "influencer";
        const finalName = name || normalizedIdentifier.split("@")[0] || "User";
        const userId = `usr_${crypto.randomUUID()}`;

        // Create the user
        await db.insert(schema.users).values({
          id: userId,
          name: finalName,
          email: normalizedIdentifier,
          emailVerified: true,
          role: finalRole,
          image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(finalName)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Fetch newly created user
        user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .get();

        if (!user) {
          throw new Error("Failed to create user record");
        }

        // Initialize profiles to avoid DB relation crashes
        if (finalRole === "influencer") {
          await db.insert(schema.influencerProfiles).values({
            userId,
            instagramHandle: `${user.id.substring(4, 12)}_ig`,
            followers: 0,
            engagementRate: 0,
            niche: "Lifestyle",
            pricing: 0,
            avgViews: 0,
            verified: false,
            level: "nano",
          });
        } else if (finalRole === "brand") {
          await db.insert(schema.brandProfiles).values({
            userId,
            companyName: `${finalName}'s Brand`,
            website: "https://richyreach.com",
            category: "General",
            description: "Active brand collaborating with top influencers.",
          });
        }
      }

      // Create a session
      const sessionToken = crypto.randomUUID();
      const sessionId = `sess_${crypto.randomUUID()}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days expiry

      await db.insert(schema.sessions).values({
        id: sessionId,
        token: sessionToken,
        userId: user.id,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Set cookie in the Hono client
      setCookie(c, "reelio_session", sessionToken, {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      });
      // Set better-auth compatible cookie for OAuth linking
      setCookie(c, "better-auth.session_token", sessionToken, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 30 * 24 * 60 * 60,
      });

      // Response payload mirrors what client expects
      return sendSuccess(
        c, 
        {
          token: sessionToken,
          isNewUser,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          }
        }, 
        "Authentication successful"
      );
    } catch (error: any) {
      console.error("[VERIFY OTP ERROR]", error);
      return sendError(c, error.message || "Failed to verify OTP code", 500);
    }
  }

  // Endpoint: POST /api/auth/logout
  static async logout(c: Context) {
    try {
      const db = getDb(c.env);
      const authHeader = c.req.header("Authorization");
      let token = getCookie(c, "reelio_session");

      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }

      if (token) {
        // Delete session from DB
        await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
      }

      // Clear cookie
      deleteCookie(c, "reelio_session", { path: "/" });
      deleteCookie(c, "better-auth.session_token", { path: "/" });

      return sendSuccess(c, null, "Logged out successfully");
    } catch (error: any) {
      return sendError(c, error.message || "Failed to log out", 500);
    }
  }

  // Endpoint: GET /api/auth/session
  static async getSession(c: Context) {
    try {
      const db = getDb(c.env);
      const authHeader = c.req.header("Authorization");
      let token = getCookie(c, "reelio_session");

      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }

      if (!token) {
        return sendError(c, "No active session token provided", 401);
      }



      // Query real session
      const session = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.token, token))
        .get();

      if (!session || session.expiresAt < new Date()) {
        if (session) {
          // Clean up expired session
          await db.delete(schema.sessions).where(eq(schema.sessions.id, session.id));
        }
        return sendError(c, "Invalid or expired session", 401);
      }

      // Fetch user details
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, session.userId))
        .get();

      if (!user) {
        return sendError(c, "User session not found", 401);
      }

      return sendSuccess(
        c,
        {
          session: {
            id: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
          },
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          }
        },
        "Active session retrieved"
      );
    } catch (error: any) {
      return sendError(c, error.message || "Failed to retrieve session info", 500);
    }
  }
}
