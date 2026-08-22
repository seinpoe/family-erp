import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const safeNext = next?.startsWith("/") ? next : "/dashboard";
  if (!code) return NextResponse.redirect(new URL("/login?error=missing-code", request.url));
  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/login?error=missing-config", request.url));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=auth-failed", request.url));
  return NextResponse.redirect(new URL(safeNext, request.url));
}
