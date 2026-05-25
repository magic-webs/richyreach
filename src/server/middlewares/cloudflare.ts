import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";

export const cloudflareMiddleware = (): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    try {
      const context = getCloudflareContext();
      if (context) {
        c.env = {
          ...c.env,
          ...context.env,
        };
      }
    } catch (e) {
      console.warn("Cloudflare context is not available (this is expected during static builds):", e);
    }
    await next();
  };
};
