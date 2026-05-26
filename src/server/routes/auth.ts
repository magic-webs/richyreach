import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { HonoEnv } from "../types";

const authRouter = new Hono<HonoEnv>()
  .post("/request-otp", AuthController.requestOtp)
  .post("/verify-otp", AuthController.verifyOtp)
  .post("/logout", AuthController.logout)
  .get("/session", AuthController.getSession);

export default authRouter;
