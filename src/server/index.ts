import { Hono } from "hono";
import { cors } from "hono/cors";
import { HonoEnv } from "./types";
import { cloudflareMiddleware } from "./middlewares/cloudflare";
import { errorHandler, notFoundHandler } from "./middlewares/error";
import usersApp from "./routes/users";
import authApp from "./routes/auth";

const app = new Hono<HonoEnv>().basePath("/api");

// Apply Global Middlewares
app.use("*", cors());
app.use("*", cloudflareMiddleware());

// Mount sub-routes
const routes = app
  .route("/users", usersApp)
  .route("/auth", authApp);

// Apply Error Handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

export type AppType = typeof routes;
export default app;
