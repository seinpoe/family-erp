import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type MembershipRow = { household_id: string };
type HouseholdRow = { id: string; name: string; base_currency: string };
type ScheduleRow = { id: string; title: string; starts_at: string };
type ActivityRow = { id: number; action: string; entity_type: string; occurred_at: string };
type FinanceRow = { amount: number | string; kind: "income" | "expense" | "transfer" | "liability" };

export type DashboardSummary = {
  status: "setup" | "no-household" | "ready" | "error";
  householdName?: string;
  currency?: string;
  upcomingEvents: ScheduleRow[];
  recentActivity: ActivityRow[];
  documentCount: number;
  reminderCount: number;
  totalExpenses: number;
  message?: string;
};

export const setupDashboardSummary: DashboardSummary = {
  status: "setup",
  upcomingEvents: [],
  recentActivity: [],
  documentCount: 0,
  reminderCount: 0,
  totalExpenses: 0,
};

export function calculateTotalExpenses(records: FinanceRow[]) {
  return records
    .filter((record) => record.kind === "expense")
    .reduce((total, record) => total + Number(record.amount), 0);
}

export async function loadDashboardSummary(supabase: SupabaseClient<Database>, userId: string): Promise<DashboardSummary> {
  const { data: membershipData, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .limit(1);

  if (membershipError) return { ...setupDashboardSummary, status: "error", message: "Your household membership could not be loaded." };
  const membership = membershipData?.[0] as MembershipRow | undefined;
  if (!membership) return { ...setupDashboardSummary, status: "no-household" };

  const householdId = membership.household_id;
  const now = new Date().toISOString();
  const [householdResult, eventsResult, activityResult, documentsResult, remindersResult, financeResult] = await Promise.all([
    supabase.from("households").select("id,name,base_currency").eq("id", householdId).is("deleted_at", null).maybeSingle(),
    supabase.from("schedule_items").select("id,title,starts_at").eq("household_id", householdId).is("deleted_at", null).gte("starts_at", now).order("starts_at", { ascending: true }).limit(5),
    supabase.from("activity_logs").select("id,action,entity_type,occurred_at").eq("household_id", householdId).order("occurred_at", { ascending: false }).limit(5),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("household_id", householdId).is("deleted_at", null),
    supabase.from("reminders").select("id", { count: "exact", head: true }).eq("household_id", householdId).is("deleted_at", null).eq("enabled", true),
    supabase.from("financial_records").select("amount,kind").eq("household_id", householdId).is("deleted_at", null),
  ]);

  if (householdResult.error || eventsResult.error || documentsResult.error || remindersResult.error || financeResult.error) {
    return { ...setupDashboardSummary, status: "error", message: "The workspace summary could not be loaded." };
  }

  const household = householdResult.data as HouseholdRow | null;
  const events = (eventsResult.data ?? []) as ScheduleRow[];
  const activity = activityResult.error ? [] : ((activityResult.data ?? []) as ActivityRow[]);
  const records = (financeResult.data ?? []) as FinanceRow[];

  return {
    status: "ready",
    householdName: household?.name,
    currency: household?.base_currency,
    upcomingEvents: events,
    recentActivity: activity,
    documentCount: documentsResult.count ?? 0,
    reminderCount: remindersResult.count ?? 0,
    totalExpenses: calculateTotalExpenses(records),
  };
}
