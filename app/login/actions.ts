"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Enter a valid email address.");
export type LoginState = { status: "idle" | "success" | "error"; message: string };
export type PasswordLoginState = LoginState & { redirectTo?: string };

function safeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.startsWith("/login")) return "/dashboard";
  return value;
}

export async function requestMagicLink(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const validation = emailSchema.safeParse(formData.get("email"));
  if (!validation.success) return { status: "error", message: validation.error.issues[0]?.message ?? "Enter a valid email address." };
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured yet. Add the Vercel environment variables and try again." };
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? requestHeaders.get("x-forwarded-host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const nextPath = safeReturnPath(formData.get("next"));
  const callbackPath = `/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const redirectTo = origin?.startsWith("http") ? `${origin}${callbackPath}` : `${protocol}://${origin}${callbackPath}`;
  const { error } = await supabase.auth.signInWithOtp({ email: validation.data, options: { emailRedirectTo: redirectTo } });
  if (error) return { status: "error", message: "We could not send a sign-in link. Check your Supabase Auth email settings and try again." };
  return { status: "success", message: "Check your email for a secure sign-in link." };
}

export async function signInWithPassword(_previousState: PasswordLoginState, formData: FormData): Promise<PasswordLoginState> {
  const email = emailSchema.safeParse(formData.get("email"));
  const password = z.string().min(1, "Enter your password.").max(128, "Password is too long.").safeParse(formData.get("password"));
  if (!email.success) return { status: "error", message: email.error.issues[0]?.message ?? "Enter a valid email address." };
  if (!password.success) return { status: "error", message: password.error.issues[0]?.message ?? "Enter your password." };

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured yet. Add the Vercel environment variables and try again." };

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
  if (error || !data.user) return { status: "error", message: "Email or password is incorrect." };

  return { status: "success", message: "Signed in. Opening your workspace…", redirectTo: safeReturnPath(formData.get("next")) };
}
