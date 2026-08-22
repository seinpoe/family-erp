import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { Badge } from "@/components/ui/badge";

export default function PasswordSecurityPage() {
  return <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:text-ink"><ArrowLeft className="size-3" /> Back to workspace</Link><section className="mt-6 border border-ink bg-surface shadow-tactile"><div className="border-b border-ink p-5 sm:p-6"><Badge>Account security</Badge><div className="mt-5 flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center border border-ink bg-canvas"><KeyRound className="size-5" aria-hidden="true" /></span><div><h1 className="text-3xl font-black uppercase leading-none tracking-[-0.065em]">Change password</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Enter your current password to set a new private password. This changes only your Supabase Auth sign-in credential and never changes your household role or access.</p></div></div></div><div className="p-5 sm:p-6"><PasswordChangeForm /></div></section></main>;
}
