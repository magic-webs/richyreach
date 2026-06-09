import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

const getBaseURL = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-api.richyreach.com/api";
  // The backend mounts Better Auth at /api/auth, so we append /auth to the api base url
  return `${apiUrl}/auth`;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    genericOAuthClient()
  ]
});
