import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type MembershipRow = { household_id: string };
type ProfileRow = { active_household_id: string | null };
type HouseholdRow = { id: string; name: string; base_currency: string };
type ScheduleRow = { id: string; title: string; starts_at: string };
type ActivityRow = { id: number; action: string; entity_type: string; occurred_at: string };
type FinanceRow = { amount: number | string; kind: "income" | "expense" | "transfer" | "liability" };

export type HouseholdOption = Pick<HouseholdRow, "id" | "name">;

export type DashboardSummary = {
  status: "setup" | "no-household" | "ready" | "error";
  householdName?: string;
  currency?: string;
  activeHouseholdId?: string;
  availableHouseholds: HouseholdOption[];
  upcomingEvents: ScheduleRow[];
  recentActivity: ActivityRow[];
  documentCount: number;
  reminderCount: number;
  totalExpenses: number;
  message?: string;
};

export const setupDashboardSummary: DashboardSummary = {
  status: "setup",
  availableHouseholds: [],
  upcomingEvents: [],
  recentActivity: [],
  documentCount: 0,
  reminderCount: 0,
  totalExpenses: 0,
};

export function calculateTotalExpenses(records: FinanceRow[]) {
  return records.filter((record) => record.kind === "expense").reduce((total, record) => total + Number(record.amount), 0);
}

export function resolveActiveHousehold(householdIds: string[], preferredHouseholdId: string | null) {
  if (preferredHouseholdId && householdIds.includes(preferredHouseholdId)) return preferredHouseholdId;
  return householdIds[0] ?? null;
}

export async function loadDashboardSummary(supabase: SupabaseClient<Database>, userId: string): Promise<DashboardSummary> {
  const [membershipResult, profileResult] = await Promise.all([
    supabase.from("household_members").select("household_id").eq("user_id", userId).is("deleted_at", null).limit(50),
    supabase.from("profiles").select("active_household_id").eq("id", userId).maybeSingle(),
  ]);

  if (membershipResult.error) return { ...setupDashboardSummary, status: "error", message: "Your household membership could not be loaded." };
  const memberships = (membershipResult.data ?? []) as MembershipRow[];
  const householdIds = memberships.map((membership) => membership.household_id);
  if (householdIds.length === 0) return { ...setupDashboardSummary, status: "no-household" };

  const profile = profileResult.error ? null : (profileResult.data as ProfileRow | null);
  const activeHouseholdId = resolveActiveHousehold(householdIds, profile?.active_household_id ?? null);
  if (!activeHouseholdId) return { ...setupDashboardSummary, status: "no-household" };

  const householdsResult = await supabase.from("households").select("id,name,base_currency").in("id", householdIds).is("deleted_at", null).order("name").limit(50);
  if (householdsResult.error) return { ...setupDashboardSummary, status: "error", message: "Your available households could not be loaded." };
  const households = (householdsResult.data ?? []) as HouseholdRow[];
  const activeHousehold = households.find((household) => household.id === activeHouseholdId);
  if (!activeHousehold) return { ...setupDashboardSummary, status: "error", message: "The selected household is no longer available." };

  const now = new Date().toISOString();
  const [eventsResult, activityResult, documentsResult, remindersResult, financeResult] = await Promise.all([
    supabase.from("schedule_items").select("id,title,starts_at").eq("household_id", activeHouseholdId).is("deleted_at", null).gte("starts_at", now).order("starts_at", { ascending: true }).limit(5),
    supabase.from("activity_logs").select("id,action,entity_type,occurred_at").eq("household_id", activeHouseholdId).order("occurred_at", { ascending: false }).limit(5),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("household_id", activeHouseholdId).is("deleted_at", null),
    supabase.from("reminders").select("id", { count: "exact", head: true }).eq("household_id", activeHouseholdId).is("deleted_at", null).eq("enabled", true),
    supabase.from("financial_records").select("amount,kind").eq("household_id", activeHouseholdId).is("deleted_at", null),
  ]);

  if (eventsResult.error || documentsResult.error || remindersResult.error || financeResult.error) {
    return { ...setupDashboardSummary, status: "error", availableHouseholds: households, message: "The workspace summary could not be loaded." };
  }

  return {
    status: "ready",
    householdName: activeHousehold.name,
    currency: activeHousehold.base_currency,
    activeHouseholdId,
    availableHouseholds: households.map(({ id, name }) => ({ id, name })),
    upcomingEvents: (eventsResult.data ?? []) as ScheduleRow[],
    recentActivity: activityResult.error ? [] : ((activityResult.data ?? []) as ActivityRow[]),
    documentCount: documentsResult.count ?? 0,
    reminderCount: remindersResult.count ?? 0,
    totalExpenses: calculateTotalExpenses((financeResult.data ?? []) as FinanceRow[]),
  };
}
