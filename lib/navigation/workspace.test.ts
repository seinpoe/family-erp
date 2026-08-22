import { describe, expect, it } from "vitest";
import { isMobileWorkspaceNavigationActive, mobileWorkspaceNavigation } from "@/lib/navigation/workspace";

describe("mobile workspace navigation", () => {
  it("keeps the primary banking-style destinations stable", () => {
    expect(mobileWorkspaceNavigation.map((item) => item.href)).toEqual(["/dashboard", "/finance", "/schedule", "/family", "/account/security"]);
  });

  it("marks direct and nested workspace routes active without marking dashboard active for every route", () => {
    expect(isMobileWorkspaceNavigationActive("/finance", "/finance")).toBe(true);
    expect(isMobileWorkspaceNavigationActive("/finance/record", "/finance")).toBe(true);
    expect(isMobileWorkspaceNavigationActive("/finance", "/dashboard")).toBe(false);
  });
});
