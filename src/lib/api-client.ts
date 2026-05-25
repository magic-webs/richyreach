import { hc } from "hono/client";
import { AppType } from "@/server";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR / Server Actions / Route Handlers
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

export const api = hc<AppType>(getBaseUrl());
export type ApiClient = typeof api;
