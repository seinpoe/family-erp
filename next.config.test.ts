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
});
