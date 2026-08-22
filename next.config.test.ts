import { afterEach, describe, expect, it, vi } from "vitest";

const originalNodeEnv = process.env.NODE_ENV;

function setNodeEnv(value: string | undefined) {
  if (value === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
  else Reflect.set(process.env, "NODE_ENV", value);
}

afterEach(() => {
  setNodeEnv(originalNodeEnv);
  vi.resetModules();
});

describe("Next.js build artifact isolation", () => {
  it("uses a dedicated development directory so a production build cannot replace preview modules", async () => {
    setNodeEnv("development");
    vi.resetModules();
    const { default: config } = await import("./next.config");
    expect(config.distDir).toBe(".next-dev");
  });

  it("keeps the standard production output directory for deployment builds", async () => {
    setNodeEnv("production");
    vi.resetModules();
    const { default: config } = await import("./next.config");
    expect(config.distDir).toBe(".next");
  });

  it("applies baseline browser hardening headers to every route", async () => {
    const { default: config } = await import("./next.config");
    const rules = await config.headers?.();
    const headers = new Map(rules?.[0]?.headers.map((header) => [header.key, header.value]));
    expect(rules?.[0]?.source).toBe("/:path*");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headers.get("Content-Security-Policy")).toContain("connect-src 'self' https://*.supabase.co");
  });
});
