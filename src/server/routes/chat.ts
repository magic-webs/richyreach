import { Hono } from "hono";
import { ChatController } from "../controllers/chat.controller";
import { requireAuth } from "../middlewares/auth";
import { HonoEnv } from "../types";

const chatRouter = new Hono<HonoEnv>()
  .use("*", requireAuth())
  .get("/rooms", ChatController.getRooms)
  .post("/room", ChatController.createRoom)
  .get("/messages/:roomId", ChatController.getMessages)
  .post("/message/:roomId", ChatController.sendMessage);

export default chatRouter;
