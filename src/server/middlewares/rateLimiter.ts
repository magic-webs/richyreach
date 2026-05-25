import { MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";
import { sendError } from "../utils/response";

// In-memory token bucket rate limiter for Edge Isolates
const limiters = new Map<string, { tokens: number; lastRefill: number }>();

export const rateLimiter = (options: {
  windowMs: number; // Time window in milliseconds (e.g. 60000 for 1 minute)
  max: number;      // Max number of requests allowed in the window
}): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    // Rate limit key: user ID if authenticated, fallback to Cloudflare client IP or general fallback
    const key = c.get("user")?.id || c.req.header("cf-connecting-ip") || "global-client";
    const now = Date.now();
    
    let client = limiters.get(key);
    
    if (!client) {
      client = { tokens: options.max, lastRefill: now };
      limiters.set(key, client);
    } else {
      // Calculate refilled tokens based on time elapsed
      const elapsed = now - client.lastRefill;
      const refilled = (elapsed / options.windowMs) * options.max;
      
      client.tokens = Math.min(options.max, client.tokens + refilled);
      client.lastRefill = now;
    }
    
    if (client.tokens < 1) {
      const retryAfterSeconds = Math.ceil((options.windowMs - (now - client.lastRefill)) / 1000);
      c.header("Retry-After", String(Math.max(1, retryAfterSeconds)));
      return sendError(c, "Too many requests. Please try again later.", 429);
    }
    
    client.tokens -= 1;
    
    c.header("X-RateLimit-Limit", String(options.max));
    c.header("X-RateLimit-Remaining", String(Math.floor(client.tokens)));
    
    await next();
  };
};
