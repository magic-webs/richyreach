import { hc } from "hono/client";
import { AppType } from "@/server";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR / Server Actions / Route Handlers
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

export const api = hc<AppType>(getBaseUrl(), {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    // Always send cookies (including reelio_session) with every API request
    return fetch(input, { ...init, credentials: "include" });
  }
});
export type ApiClient = typeof api;
