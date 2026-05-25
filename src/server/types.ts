export interface HonoEnv {
  Bindings: CloudflareEnv;
  Variables: {
    user?: { id: string; email: string };
  };
}
