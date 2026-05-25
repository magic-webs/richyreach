import { ErrorHandler, NotFoundHandler } from "hono";
import { HonoEnv } from "../types";

export const errorHandler: ErrorHandler<HonoEnv> = async (err, c) => {
  console.error(`[API Error] ${err.name}: ${err.message}`, err);

  // Determine status code if available
  const status = "status" in err && typeof err.status === "number" ? err.status : 500;
  
  return c.json(
    {
      success: false,
      error: {
        message: err.message || "Internal Server Error",
        code: err.name || "INTERNAL_SERVER_ERROR",
      },
    },
    status as any
  );
};

export const notFoundHandler: NotFoundHandler<HonoEnv> = async (c) => {
  return c.json(
    {
      success: false,
      error: {
        message: `Route not found: ${c.req.method} ${c.req.path}`,
        code: "NOT_FOUND",
      },
    },
    404
  );
};
