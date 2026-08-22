import { resolveActiveHousehold } from "@/lib/dashboard/summary";
import { createClient } from "@/lib/supabase/server";

export async function getActiveHouseholdContext() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const [membershipResult, profileResult] = await Promise.all([
    supabase.from("household_members").select("household_id,role").eq("user_id", userData.user.id).is("deleted_at", null).limit(50),
    supabase.from("profiles").select("active_household_id").eq("id", userData.user.id).maybeSingle(),
  ]);
  if (membershipResult.error) return null;
  const memberships = (membershipResult.data ?? []) as { household_id: string; role: "owner" | "adult" | "limited" }[];
  const householdIds = memberships.map((membership) => membership.household_id);
  const activeId = resolveActiveHousehold(householdIds, (profileResult.data as { active_household_id: string | null } | null)?.active_household_id ?? null);
  if (!activeId) return null;

  const { data: household } = await supabase.from("households").select("id,name,base_currency,timezone").eq("id", activeId).is("deleted_at", null).maybeSingle();
  if (!household) return null;
  return { supabase, user: userData.user, role: memberships.find((membership) => membership.household_id === activeId)?.role ?? "limited", household: household as { id: string; name: string; base_currency: string; timezone: string } };
}
