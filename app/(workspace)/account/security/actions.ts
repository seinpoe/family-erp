"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z.string().min(12, "Use at least 12 characters for your new password.").max(128, "Password is too long.");
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: passwordSchema,
  confirmation: z.string(),
}).superRefine((value, context) => {
  if (value.newPassword !== value.confirmation) context.addIssue({ code: "custom", path: ["confirmation"], message: "New password confirmation does not match." });
  if (value.newPassword === value.currentPassword) context.addIssue({ code: "custom", path: ["newPassword"], message: "Choose a new password that differs from the current one." });
});

export type PasswordChangeState = { status: "idle" | "success" | "error"; message: string };

export async function changePassword(_previousState: PasswordChangeState, formData: FormData): Promise<PasswordChangeState> {
  const validation = passwordChangeSchema.safeParse({ currentPassword: formData.get("currentPassword"), newPassword: formData.get("newPassword"), confirmation: formData.get("confirmation") });
  if (!validation.success) return { status: "error", message: validation.error.issues[0]?.message ?? "Review the password fields and try again." };

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured yet. Add the Vercel environment variables and try again." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { status: "error", message: "Sign in before changing your password." };

  const verification = await supabase.auth.signInWithPassword({ email: user.email, password: validation.data.currentPassword });
  if (verification.error) return { status: "error", message: "Your current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: validation.data.newPassword });
  if (error) return { status: "error", message: "Your password could not be updated. Please try again." };
  return { status: "success", message: "Password updated. Keep it private and use it for your next sign-in." };
}
