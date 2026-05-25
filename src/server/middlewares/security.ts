import { MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";
import { sendError } from "../utils/response";

export const securityHeaders = (): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    // Basic Helmet-like headers
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("X-XSS-Protection", "1; mode=block");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;");
    
    await next();
  };
};

// Input sanitization middleware to check for XSS patterns in request bodies
export const inputSanitizer = (): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    if (c.req.method === "POST" || c.req.method === "PUT" || c.req.method === "PATCH") {
      try {
        const contentType = c.req.header("Content-Type") || "";
        if (contentType.includes("application/json")) {
          // Clone the body to prevent breaking JSON parse downstream
          const body = await c.req.raw.clone().json();
          
          if (body && typeof body === "object") {
            const hasXss = checkXssPattern(body);
            if (hasXss) {
              return sendError(c, "Bad Request: Malicious content detected", 400);
            }
          }
        }
      } catch (err) {
        // Body reading failed or empty body, ignore and let routing layer handle it
      }
    }
    await next();
  };
};

function checkXssPattern(obj: any): boolean {
  const xssPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  const javascriptUriPattern = /javascript:/gi;
  const htmlTagPattern = /<[^>]*>/g; // Check for arbitrary HTML tags if strict, but we only block script/js uri
  
  const serialized = JSON.stringify(obj);
  return xssPattern.test(serialized) || javascriptUriPattern.test(serialized);
}
