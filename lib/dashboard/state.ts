import type { DashboardSummary } from "@/lib/dashboard/summary";

export function dashboardStateCopy(summary: DashboardSummary, configured: boolean) {
  if (summary.status === "ready") return null;
  if (summary.status === "setup") return { title: "Setup required", body: "Add the Supabase URL and anonymous key to Vercel, then authenticate to create your household workspace.", showOnboarding: false };
  if (summary.status === "no-household") return { title: "Create or join a household", body: "Your account is authenticated but does not yet belong to a household. Create the workspace below to become its owner.", showOnboarding: configured };
  return { title: "Workspace status", body: summary.message ?? "The household workspace could not be loaded. Please refresh and try again.", showOnboarding: false };
}
