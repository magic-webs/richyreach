import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(env?: Record<string, any>) {
  if (dbInstance) return dbInstance;

  const url = env?.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = env?.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    const isProduction = process.env.NODE_ENV === "production" || (typeof window === "undefined" && !process.env.NEXT_DEV);
    if (isProduction) {
      throw new Error(
        "TURSO_DATABASE_URL is not configured. Please define it in your Cloudflare Pages project settings (Environment Variables)."
      );
    }
    
    // Local development fallback
    const client = createClient({ url: "file:local.db" });
    dbInstance = drizzle(client, { schema });
    return dbInstance;
  }

  const client = createClient({ url, authToken });
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
