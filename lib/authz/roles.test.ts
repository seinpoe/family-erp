import { describe, expect, it } from "vitest";
import { canManageMembers, canWriteOperationalRecords, isHouseholdRole } from "@/lib/authz/roles";

describe("household role capabilities", () => {
  it("reserves membership administration for owners", () => {
    expect(canManageMembers("owner")).toBe(true);
    expect(canManageMembers("adult")).toBe(false);
    expect(canManageMembers("limited")).toBe(false);
  });

  it("allows adults but not limited members to edit operating records", () => {
    expect(canWriteOperationalRecords("owner")).toBe(true);
    expect(canWriteOperationalRecords("adult")).toBe(true);
    expect(canWriteOperationalRecords("limited")).toBe(false);
  });

  it("does not treat a platform system administrator as a household role", () => {
    expect(isHouseholdRole("system_administrator")).toBe(false);
    expect(isHouseholdRole("owner")).toBe(true);
  });
});
