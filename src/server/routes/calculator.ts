import { Hono } from "hono";
import { CalculatorController } from "../controllers/calculator.controller";
import { rateLimiter } from "../middlewares/rateLimiter";
import { HonoEnv } from "../types";

const calculatorRouter = new Hono<HonoEnv>()
  .use("*", rateLimiter({ windowMs: 60000, max: 100 })) // Allow 100 requests per minute
  .post("/reach", CalculatorController.getReach)
  .post("/earnings", CalculatorController.getEarnings);

export default calculatorRouter;
