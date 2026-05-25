import { MiddlewareHandler } from "hono";
import { HonoEnv } from "../types";
import { sendError } from "../utils/response";

export const requireRole = (
  allowedRoles: ("influencer" | "brand" | "admin")[]
): MiddlewareHandler<HonoEnv> => {
  return async (c, next) => {
    const user = c.get("user");
    
    if (!user) {
      return sendError(c, "Unauthorized. Authentication is required.", 401);
    }
    
    if (!allowedRoles.includes(user.role)) {
      return sendError(
        c,
        `Forbidden. Access restricted to roles: [${allowedRoles.join(", ")}]. Current role: [${user.role}].`,
        403
      );
    }
    
    await next();
  };
};
