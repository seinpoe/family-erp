import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: vi.fn(() => true) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/dashboard/summary", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dashboard/summary")>("@/lib/dashboard/summary");
  return { ...actual, loadDashboardSummary: vi.fn() };
});

import DashboardPage from "@/app/(workspace)/dashboard/page";
import { loadDashboardSummary, setupDashboardSummary } from "@/lib/dashboard/summary";
import { createClient } from "@/lib/supabase/server";

afterEach(() => vi.clearAllMocks());

describe("configured dashboard route", () => {
  it("passes a configured, ready household summary to the dashboard workspace", async () => {
    vi.mocked(createClient).mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "member@example.com" } } }) } } as never);
    vi.mocked(loadDashboardSummary).mockResolvedValue({ ...setupDashboardSummary, status: "ready", householdName: "Family" });
    const element = await DashboardPage();
    expect(element.props.configured).toBe(true);
    expect(element.props.userEmail).toBe("member@example.com");
    expect(element.props.summary.status).toBe("ready");
  });

  it("uses the setup state when no configured-session user is available", async () => {
    vi.mocked(createClient).mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } } as never);
    const element = await DashboardPage();
    expect(element.props.summary).toEqual(setupDashboardSummary);
  });

  it("preserves a direct configured no-household or summary-error result for dashboard rendering", async () => {
    vi.mocked(createClient).mockResolvedValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "member@example.com" } } }) } } as never);
    vi.mocked(loadDashboardSummary).mockResolvedValue({ ...setupDashboardSummary, status: "no-household" });
    expect((await DashboardPage()).props.summary.status).toBe("no-household");
    vi.mocked(loadDashboardSummary).mockResolvedValue({ ...setupDashboardSummary, status: "error", message: "Summary failure" });
    expect((await DashboardPage()).props.summary).toMatchObject({ status: "error", message: "Summary failure" });
  });
});
