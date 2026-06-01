export interface HonoEnv {
  Bindings: any;
  Variables: {
    user?: {
      id: string;
      name: string;
      email: string;
      role: "influencer" | "brand" | "admin";
    };
  };
}

