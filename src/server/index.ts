import { Hono } from "hono";
import { cors } from "hono/cors";
import { HonoEnv } from "./types";
import { errorHandler, notFoundHandler } from "./middlewares/error";
import { securityHeaders, inputSanitizer } from "./middlewares/security";

// Import Routes
import usersApp from "./routes/users";
import authRouter from "./routes/auth";
import { AuthController } from "./controllers/auth.controller";
import influencerRouter from "./routes/influencers";
import brandRouter from "./routes/brands";
import campaignRouter from "./routes/campaigns";
import chatRouter from "./routes/chat";
import calculatorRouter from "./routes/calculator";
import notificationRouter from "./routes/notifications";
import paymentRouter from "./routes/payments";
import adminRouter from "./routes/admin";
import walletRouter from "./routes/wallet";
import arenaRouter from "./routes/arena";

// Import OpenAPI specification generator
import { getOpenApiSpec } from "./utils/openapi";

const app = new Hono<HonoEnv>().basePath("/api");

// Apply Global Middlewares
app.use("*", async (c, next) => {
  if (!c.env) {
    c.env = process.env as any;
  }
  await next();
});
app.use("*", cors());
app.use("*", securityHeaders());
app.use("*", inputSanitizer());

// Mount sub-routes
const routes = app
  .route("/users", usersApp)
  .route("/auth", authRouter)
  .route("/influencers", influencerRouter)
  .route("/brands", brandRouter)
  .route("/campaigns", campaignRouter)
  .route("/chat", chatRouter)
  .route("/calculator", calculatorRouter)
  .route("/notifications", notificationRouter)
  .route("/payments", paymentRouter)
  .route("/admin", adminRouter)
  .route("/wallet", walletRouter)
  .route("/arena", arenaRouter);

// Swagger Documentation API
app.get("/openapi.json", (c) => {
  return c.json(getOpenApiSpec(c.req.header("host") || "localhost:3000"));
});

app.get("/docs", (c) => {
  const host = c.req.header("host") || "localhost:3000";
  const schemaUrl = `/api/openapi.json`;

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Reelio API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
      <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-32x32.png" />
      <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js" charset="UTF-8"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: "${schemaUrl}",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
});

// Apply Centralized Error Handlers
app.onError(errorHandler);
app.notFound(notFoundHandler);

export type AppType = typeof routes;
export default app;
