import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { HonoEnv } from "../types";
import { auth } from "../auth";

const authRouter = new Hono<HonoEnv>()
  .post("/request-otp", AuthController.requestOtp)
  .post("/verify-otp", AuthController.verifyOtp)
  .post("/logout", AuthController.logout)
  .get("/session", AuthController.getSession)
  .on(["POST", "GET"], "/*", (c) => auth.handler(c.req.raw));

export default authRouter;
