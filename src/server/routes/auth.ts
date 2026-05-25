import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { HonoEnv } from "../types";

const authRouter = new Hono<HonoEnv>()
  .post("/signup", AuthController.signUp)
  .post("/login", AuthController.login)
  .post("/logout", AuthController.logout)
  .get("/session", AuthController.getSession)
  // Better Auth catch-all (exposes /signin/google, /callback/*, etc.)
  .on("*", "/*", AuthController.handleAuth);

export default authRouter;
