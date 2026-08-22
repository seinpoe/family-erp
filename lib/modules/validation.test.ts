import { describe, expect, it } from "vitest";
import { financialRecordSchema, reminderSchema, scheduleSchema } from "@/lib/modules/validation";

describe("core ERP module validation", () => {
  it("normalizes financial currencies and rejects negative amounts", () => {
    expect(financialRecordSchema.parse({ kind: "expense", title: "Groceries", amount: "25.40", currency: "usd", occurredOn: "2026-08-22" }).currency).toBe("USD");
    expect(financialRecordSchema.safeParse({ kind: "expense", title: "Groceries", amount: -1, currency: "USD", occurredOn: "2026-08-22" }).success).toBe(false);
  });

  it("rejects inverted schedule windows and invalid reminder lead times", () => {
    expect(scheduleSchema.safeParse({ title: "Care visit", startsAt: "2026-08-22T10:00", endsAt: "2026-08-22T09:00" }).success).toBe(false);
    expect(reminderSchema.safeParse({ kind: "bill", title: "Internet", dueAt: "2026-08-22T10:00", leadTimeMinutes: -1 }).success).toBe(false);
  });
});
