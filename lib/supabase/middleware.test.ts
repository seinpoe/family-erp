import { describe, expect, it } from "vitest";
import { loginRedirectPath, requiresAuthentication } from "@/lib/supabase/middleware";

describe("configured dashboard route protection", () => {
  it("marks dashboard paths as authenticated routes and preserves the intended destination", () => {
    expect(requiresAuthentication("/dashboard")).toBe(true);
    expect(requiresAuthentication("/dashboard/finance")).toBe(true);
    expect(requiresAuthentication("/")).toBe(false);
    expect(loginRedirectPath("/dashboard/finance")).toBe("/login?next=%2Fdashboard%2Ffinance");
  });
});
