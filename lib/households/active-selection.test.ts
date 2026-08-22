import { describe, expect, it } from "vitest";
import { activeHouseholdPersistenceError, activeHouseholdUpdateSucceeded } from "@/lib/households/active-selection";

describe("active household persistence", () => {
  it("confirms only the requested household ID was persisted", () => {
    expect(activeHouseholdUpdateSucceeded("household-a", "household-a")).toBe(true);
    expect(activeHouseholdUpdateSucceeded("household-b", "household-a")).toBe(false);
    expect(activeHouseholdUpdateSucceeded(null, "household-a")).toBe(false);
  });
});

describe("active household action outcomes", () => {
  it("rejects a no-membership or membership-error branch before attempting persistence", () => {
    expect(activeHouseholdPersistenceError({
      hasMembership: false,
      membershipFailed: false,
      updateFailed: false,
      persistedHouseholdId: null,
      requestedHouseholdId: "household-a",
    })).toBe("You no longer have access to that household.");
    expect(activeHouseholdPersistenceError({
      hasMembership: true,
      membershipFailed: true,
      updateFailed: false,
      persistedHouseholdId: null,
      requestedHouseholdId: "household-a",
    })).toBe("You no longer have access to that household.");
  });

  it("surfaces an RLS-rejected update and confirms a persisted success branch", () => {
    expect(activeHouseholdPersistenceError({
      hasMembership: true,
      membershipFailed: false,
      updateFailed: true,
      persistedHouseholdId: null,
      requestedHouseholdId: "household-a",
    })).toBe("Your active household could not be saved. Please try again.");
    expect(activeHouseholdPersistenceError({
      hasMembership: true,
      membershipFailed: false,
      updateFailed: false,
      persistedHouseholdId: "household-a",
      requestedHouseholdId: "household-a",
    })).toBeNull();
  });
});
