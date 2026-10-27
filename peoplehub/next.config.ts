import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the sandbox preview host (https://<port>-<id>.e2b.app) talk to the
  // dev server's internal /_next/* endpoints without being blocked.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost:3000", "127.0.0.1:3000"],
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
