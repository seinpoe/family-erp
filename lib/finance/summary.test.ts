import { describe, expect, it } from "vitest";
import { summarizeFinanceRecords } from "@/lib/finance/summary";

describe("finance summary", () => {
  it("summarizes same-currency financial records without treating transfers as spend", () => {
    expect(summarizeFinanceRecords([
      { kind: "income", amount: "2500.00", currency: "USD" },
      { kind: "expense", amount: 425.5, currency: "USD" },
      { kind: "transfer", amount: 200, currency: "USD" },
      { kind: "liability", amount: 75, currency: "USD" },
    ])).toEqual({ currency: "USD", hasMultipleCurrencies: false, income: 2500, expenses: 425.5, liabilities: 75, recordCount: 4 });
  });

  it("does not fabricate a combined balance across different currencies", () => {
    expect(summarizeFinanceRecords([
      { kind: "income", amount: 100, currency: "USD" },
      { kind: "expense", amount: 2000, currency: "THB" },
    ])).toEqual({ currency: null, hasMultipleCurrencies: true, income: null, expenses: null, liabilities: null, recordCount: 2 });
  });
});
