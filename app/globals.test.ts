import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("Family ERP color system", () => {
  it("defines the requested light palette", () => {
    expect(stylesheet).toContain("--app-brand: #1877f2");
    expect(stylesheet).toContain("--app-surface: #ffffff");
    expect(stylesheet).toContain("--app-canvas: #f0f2f5");
  });

  it("maps dark mode to the requested neutral surfaces", () => {
    expect(stylesheet).toContain("color-scheme: light dark");
    expect(stylesheet).toContain(":root[data-theme=\"dark\"]");
    expect(stylesheet).toContain("--app-canvas: #18191a");
    expect(stylesheet).toContain("--app-surface: #242526");
  });
});
