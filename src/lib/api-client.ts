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
    const headers = new Headers(init?.headers || {});
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reelio_mock_user");
      if (saved) {
        try {
          const user = JSON.parse(saved);
          headers.set("Authorization", `Bearer mock-${user.role}`);
        } catch (e) {}
      }
    }
    return fetch(input, { ...init, headers });
  }
});
export type ApiClient = typeof api;
