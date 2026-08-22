import { describe, expect, it } from "vitest";
import { setupDashboardSummary, type DashboardSummary } from "@/lib/dashboard/summary";
import { dashboardStateCopy } from "@/lib/dashboard/state";

const ready: DashboardSummary = { ...setupDashboardSummary, status: "ready" };

describe("dashboard workspace states", () => {
  it("keeps ready dashboards free of setup notices", () => expect(dashboardStateCopy(ready, true)).toBeNull());
  it("returns the intended setup, no-household, and error states", () => {
    expect(dashboardStateCopy(setupDashboardSummary, false)?.title).toBe("Setup required");
    expect(dashboardStateCopy({ ...setupDashboardSummary, status: "no-household" }, true)?.showOnboarding).toBe(true);
    expect(dashboardStateCopy({ ...setupDashboardSummary, status: "error", message: "Summary failure" }, true)?.body).toBe("Summary failure");
  });
});
