import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HonoEnv } from "../types";
import { getDb } from "../db";
import { users } from "../db/schema";

const usersApp = new Hono<HonoEnv>()
  .get("/", async (c) => {
    const db = getDb(c.env);
    const data = await db.select().from(users);
    return c.json({
      success: true,
      data,
    });
  })
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
      })
    ),
    async (c) => {
      const { name, email } = c.req.valid("json");
      const db = getDb(c.env);
      
      const id = crypto.randomUUID();
      const newUser = {
        id,
        name,
        email,
      };
      
      await db.insert(users).values(newUser);
      
      return c.json(
        {
          success: true,
          data: newUser,
        },
        201
      );
    }
  );

export default usersApp;
