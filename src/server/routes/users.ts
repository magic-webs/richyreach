import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HonoEnv } from "../types";

// Mock user store
const mockUsers = [
  { id: "1", name: "Alice Doe", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
];

const usersApp = new Hono<HonoEnv>()
  .get("/", (c) => {
    return c.json({
      success: true,
      data: mockUsers,
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
      
      const newUser = {
        id: String(mockUsers.length + 1),
        name,
        email,
      };
      
      mockUsers.push(newUser);
      
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
