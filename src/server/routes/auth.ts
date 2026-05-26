import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
import { HonoEnv } from "../types";

const authRouter = new Hono<HonoEnv>()
  .post("/signup", AuthController.signUp)
  .post("/login", AuthController.login)
  .post("/logout", AuthController.logout)
  .get("/session", AuthController.getSession);

export default authRouter;
