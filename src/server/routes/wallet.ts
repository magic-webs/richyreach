import { Hono } from "hono";
import { WalletController } from "../controllers/wallet.controller";
import { requireAuth } from "../middlewares/auth";
import { HonoEnv } from "../types";

const walletRouter = new Hono<HonoEnv>()
  .use("*", requireAuth())
  .get("/", WalletController.getBalance)
  .post("/create-order", WalletController.createOrder)
  .post("/verify", WalletController.verifyPayment);

export default walletRouter;
