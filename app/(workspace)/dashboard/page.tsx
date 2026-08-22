import React from "react";
import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { resolveWithin } from "@/lib/async/recovery";
import { loadDashboardSummary, setupDashboardSummary } from "@/lib/dashboard/summary";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const unauthenticatedResponse = { data: { user: null }, error: null as never };
  const { data } = supabase ? await resolveWithin(() => supabase.auth.getUser(), unauthenticatedResponse, 4500) : unauthenticatedResponse;
  const summaryFallback = { ...setupDashboardSummary, status: "error" as const, message: "The household summary took too long to load. Refresh to try again." };
  const summary = supabase && data.user ? await resolveWithin(() => loadDashboardSummary(supabase, data.user.id), summaryFallback, 7000) : setupDashboardSummary;
  return <DashboardWorkspace configured={isSupabaseConfigured()} userEmail={data.user?.email} summary={summary} />;
}
