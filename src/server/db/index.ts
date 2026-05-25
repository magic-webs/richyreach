import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(env?: Record<string, any>) {
  if (dbInstance) return dbInstance;

  const url = process.env.TURSO_DATABASE_URL || env?.TURSO_DATABASE_URL || "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN || env?.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
