import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for optimized Docker standalone builds
  output: "standalone",
  // Disable Next.js telemetry in production
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },
};

export default nextConfig;
