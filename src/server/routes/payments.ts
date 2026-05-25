import { Hono } from "hono";
import { PaymentController } from "../controllers/payment.controller";
import { requireAuth } from "../middlewares/auth";
import { requireRole } from "../middlewares/role";
import { HonoEnv } from "../types";

const paymentRouter = new Hono<HonoEnv>()
  .post("/webhook", PaymentController.handleWebhook) // Public endpoint for stripe webhooks
  .use("*", requireAuth())
  .use("*", requireRole(["brand"]))
  .post("/create", PaymentController.createCheckoutSession);

export default paymentRouter;
