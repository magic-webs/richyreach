import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(env?: Record<string, any>) {
  // If we already have an active database instance, return it
  if (dbInstance) return dbInstance;

  // Resolve Turso credentials
  let url = env?.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
  let authToken = env?.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  // Prioritize remote Turso URL from process.env if the worker environment was mocked locally to file:local.db
  const processUrl = process.env.TURSO_DATABASE_URL;
  if (processUrl && (processUrl.startsWith("libsql://") || processUrl.startsWith("https://"))) {
    url = processUrl;
    authToken = process.env.TURSO_AUTH_TOKEN || authToken;
  }

  // Fallback to local SQLite file for local development if Turso variables are missing
  if (!url) {
    url = "file:local.db";
  }

  if (!url) {
    const isProduction = process.env.NODE_ENV === "production" || (typeof window === "undefined" && !process.env.NEXT_DEV);
    if (isProduction) {
      throw new Error(
        "Environment variables not set for the database connection"
      );
    }
  }

  console.log("[getDb] Connecting to DB URL:", JSON.stringify(url));
  
  const client = createClient({ url, authToken });
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
