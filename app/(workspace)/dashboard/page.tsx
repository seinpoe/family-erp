import React from "react";
import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { loadDashboardSummary, setupDashboardSummary } from "@/lib/dashboard/summary";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const summary = supabase && data.user ? await loadDashboardSummary(supabase, data.user.id) : setupDashboardSummary;
  return <DashboardWorkspace configured={isSupabaseConfigured()} userEmail={data.user?.email} summary={summary} />;
}
