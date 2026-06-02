import { Hono } from "hono";
import { ArenaController } from "../controllers/arena.controller";
import { requireAuth } from "../middlewares/auth";
import { HonoEnv } from "../types";

const arenaRouter = new Hono<HonoEnv>()
  .get("/", requireAuth(), ArenaController.getActiveArenas)
  .get("/:id/leaderboard", requireAuth(), ArenaController.getArenaLeaderboard)
  .post("/:id/join", requireAuth(), ArenaController.joinArena);

export default arenaRouter;
