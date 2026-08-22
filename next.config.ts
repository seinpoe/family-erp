import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development server artifacts separate from production builds so a build
  // cannot replace modules while `next dev` is serving a preview request.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  poweredByHeader: false,
  reactStrictMode: true,
  images: { remotePatterns: [] },
};

export default nextConfig;
