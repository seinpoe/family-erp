import { describe, expect, it } from "vitest";
import { householdSetupSchema } from "@/lib/households/validation";

describe("household setup validation", () => {
  it("normalizes a valid household slug and base currency", () => {
    expect(householdSetupSchema.parse({
      name: "The Lin Family",
      slug: "lin-home",
      timezone: "Asia/Yangon",
      baseCurrency: "usd",
    })).toMatchObject({ slug: "lin-home", baseCurrency: "USD" });
  });

  it("rejects a slug that could create an unsafe path or invalid route", () => {
    expect(householdSetupSchema.safeParse({
      name: "The Lin Family",
      slug: "lin home/unsafe",
      timezone: "Asia/Yangon",
      baseCurrency: "USD",
    }).success).toBe(false);
  });
});
