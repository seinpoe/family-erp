"use server";

import { revalidatePath } from "next/cache";
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
