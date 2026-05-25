import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HonoEnv } from "../types";

const authApp = new Hono<HonoEnv>()
  .post(
    "/login",
    zValidator(
      "json",
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    ),
    async (c) => {
      const { email } = c.req.valid("json");
      
      return c.json({
        success: true,
        message: "Successfully logged in",
        user: {
          id: "user_123",
          email,
        },
      });
    }
  )
  .post(
    "/register",
    zValidator(
      "json",
      z.object({
        name: z.string().min(2),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    ),
    async (c) => {
      const { name, email } = c.req.valid("json");
      
      return c.json({
        success: true,
        message: "Successfully registered",
        user: {
          id: "user_123",
          name,
          email,
        },
      });
    }
  );

export default authApp;
