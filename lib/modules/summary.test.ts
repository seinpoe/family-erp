import { describe, expect, it } from "vitest";
import { getModuleSnapshot } from "@/lib/modules/summary";

describe("module snapshots", () => {
  it("uses truthful record counts and module-specific guidance", () => {
    expect(getModuleSnapshot("documents", 1)).toEqual({ label: "Vault snapshot", countLabel: "1 private file", guidance: "Keep files private, searchable, and linked to the household record that explains them." });
    expect(getModuleSnapshot("reminders", 3).countLabel).toBe("3 active reminders");
  });
});
