export interface HonoEnv {
  Bindings: CloudflareEnv;
  Variables: {
    user?: {
      id: string;
      name: string;
      email: string;
      role: "influencer" | "brand" | "admin";
    };
  };
}

