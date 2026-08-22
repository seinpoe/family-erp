"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { activeHouseholdPersistenceError } from "@/lib/households/active-selection";
import { householdSetupSchema } from "@/lib/households/validation";
import { createClient } from "@/lib/supabase/server";

export type HouseholdSetupState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createHouseholdWorkspace(_previousState: HouseholdSetupState, formData: FormData): Promise<HouseholdSetupState> {
  const validation = householdSetupSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    timezone: formData.get("timezone"),
    baseCurrency: formData.get("baseCurrency"),
  });

  if (!validation.success) {
    return { status: "error", message: validation.error.issues[0]?.message ?? "Check the household details and try again." };
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase has not been configured for this deployment yet." };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { status: "error", message: "Sign in before creating a household workspace." };

  const { error } = await supabase.rpc("create_household_workspace", {
    p_name: validation.data.name,
    p_slug: validation.data.slug,
    p_timezone: validation.data.timezone,
    p_base_currency: validation.data.baseCurrency,
  });

  if (error) {
    return { status: "error", message: "The household could not be created. The workspace slug may already be in use." };
  }

  revalidatePath("/dashboard");
  return { status: "success", message: "Household workspace created. Refreshing your dashboard." };
}

export type HouseholdSwitchState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function chooseActiveHousehold(_previousState: HouseholdSwitchState, formData: FormData): Promise<HouseholdSwitchState> {
  const householdId = z.string().uuid().safeParse(formData.get("householdId"));
  if (!householdId.success) return { status: "error", message: "The selected household is invalid." };

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase has not been configured for this deployment yet." };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { status: "error", message: "Sign in before changing your active household." };

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("household_id", householdId.data)
    .eq("user_id", userData.user.id)
    .is("deleted_at", null)
    .maybeSingle();

  // This update is still constrained by the profile RLS policy and the membership check in its WITH CHECK clause.
  const shouldAttemptUpdate = !membershipError && Boolean(membership);
  const updateResult = shouldAttemptUpdate
    ? await supabase.from("profiles").update({ active_household_id: householdId.data }).eq("id", userData.user.id).select("active_household_id").maybeSingle()
    : { data: null, error: null };

  const persistenceError = activeHouseholdPersistenceError({
    hasMembership: Boolean(membership),
    membershipFailed: Boolean(membershipError),
    updateFailed: Boolean(updateResult.error),
    persistedHouseholdId: updateResult.data?.active_household_id as string | null | undefined,
    requestedHouseholdId: householdId.data,
  });

  if (persistenceError) return { status: "error", message: persistenceError };

  revalidatePath("/dashboard");
  return { status: "success", message: "Active household updated." };
}
