import type { NextConfig } from "next";

const browserSecurityHeaders = [
  { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; worker-src 'self' blob:; manifest-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
] as const;

const nextConfig: NextConfig = {
  // Keep development server artifacts separate from production builds so a build
  // cannot replace modules while `next dev` is serving a preview request.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  poweredByHeader: false,
  reactStrictMode: true,
  images: { remotePatterns: [] },
  async headers() {
    return [{ source: "/:path*", headers: browserSecurityHeaders.map((header) => ({ ...header })) }];
  },
};

export default nextConfig;
