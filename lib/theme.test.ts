import { describe, expect, it } from "vitest";
import { resolveTheme } from "@/lib/theme";

describe("theme resolution", () => {
  it("gives an explicit query preference priority for predictable visual QA", () => {
    expect(resolveTheme("dark", "light", false)).toBe("dark");
  });

  it("uses the saved preference before the operating-system preference", () => {
    expect(resolveTheme(null, "light", true)).toBe("light");
  });

  it("uses the operating-system preference only when no explicit setting exists", () => {
    expect(resolveTheme(null, null, true)).toBe("dark");
  });
});
