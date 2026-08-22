import { describe, expect, it } from "vitest";
import { calculateTotalExpenses, resolveActiveHousehold } from "@/lib/dashboard/summary";

describe("dashboard financial aggregation", () => {
  it("includes only household expense records in the key total", () => {
    expect(calculateTotalExpenses([{ kind: "income", amount: 850 }, { kind: "expense", amount: "120.50" }, { kind: "transfer", amount: 20 }, { kind: "expense", amount: 79.5 }])).toBe(200);
  });
});

describe("active household selection", () => {
  it("uses a valid stored preference, then safely falls back to the first membership", () => {
    expect(resolveActiveHousehold(["home-a", "home-b"], "home-b")).toBe("home-b");
    expect(resolveActiveHousehold(["home-a", "home-b"], "unrelated-home")).toBe("home-a");
  });
});
