import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "../db";
import * as schema from "../db/schema";

export function getAuth(env: Record<string, any>) {
  const db = getDb(env);
  
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        users: schema.users,
        sessions: schema.sessions,
        accounts: schema.accounts,
        verifications: schema.verifications,
      },
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "google-client-id",
        clientSecret: env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || "google-client-secret",
      },
    },
    user: {
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    // Required for cookie secure flags and callbacks in production
    baseURL: env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  });
}
