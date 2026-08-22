"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Enter a valid email address.");
export type LoginState = { status: "idle" | "success" | "error"; message: string };

export async function requestMagicLink(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const validation = emailSchema.safeParse(formData.get("email"));
  if (!validation.success) return { status: "error", message: validation.error.issues[0]?.message ?? "Enter a valid email address." };
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Supabase is not configured yet. Add the Vercel environment variables and try again." };
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? requestHeaders.get("x-forwarded-host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const redirectTo = origin?.startsWith("http") ? `${origin}/auth/callback` : `${protocol}://${origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOtp({ email: validation.data, options: { emailRedirectTo: redirectTo } });
  if (error) return { status: "error", message: "We could not send a sign-in link. Check your Supabase Auth email settings and try again." };
  return { status: "success", message: "Check your email for a secure sign-in link." };
}
