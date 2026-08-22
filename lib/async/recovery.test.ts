import { describe, expect, it, vi } from "vitest";
import { resolveWithin } from "@/lib/async/recovery";

describe("resolveWithin", () => {
  it("returns the successful operation result before its deadline", async () => {
    await expect(resolveWithin(async () => "loaded", "fallback", 100)).resolves.toBe("loaded");
  });

  it("uses the safe fallback when an operation fails", async () => {
    await expect(resolveWithin(async () => { throw new Error("unavailable"); }, "fallback", 100)).resolves.toBe("fallback");
  });

  it("uses the safe fallback when an operation exceeds its deadline", async () => {
    vi.useFakeTimers();
    const result = resolveWithin(() => new Promise<string>(() => undefined), "fallback", 500);
    await vi.advanceTimersByTimeAsync(500);
    await expect(result).resolves.toBe("fallback");
    vi.useRealTimers();
  });
});
