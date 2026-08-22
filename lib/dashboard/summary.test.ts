import { describe, expect, it } from "vitest";
import { calculateTotalExpenses } from "@/lib/dashboard/summary";

describe("dashboard financial aggregation", () => {
  it("includes only household expense records in the key total", () => {
    expect(calculateTotalExpenses([
      { kind: "income", amount: 850 },
      { kind: "expense", amount: "120.50" },
      { kind: "transfer", amount: 20 },
      { kind: "expense", amount: 79.5 },
    ])).toBe(200);
  });
});
