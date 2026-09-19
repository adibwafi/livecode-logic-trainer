import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for optimized Docker standalone builds (omit on Vercel for native serverless output)
  output: process.env.VERCEL ? undefined : "standalone",
  // Disable Next.js telemetry in production
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
  },
};

export default nextConfig;
