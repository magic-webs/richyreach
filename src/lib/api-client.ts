const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "https://backend-api.richyreach.com/api";
};

export const api = async (path: string, options: RequestInit = {}) => {
  const baseUrl = getBaseUrl();
  // Ensure we don't end up with double slashes if path has a leading slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers = new Headers(options.headers);

  // Check if token exists in localStorage (only in client/browser environment)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("richyreach_session_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // Required for session cookie handling
  });
};

export type ApiClient = typeof api;

