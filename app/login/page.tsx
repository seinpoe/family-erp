import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { PasswordSignInForm } from "@/components/auth/password-sign-in-form";
import { Badge } from "@/components/ui/badge";

export default async function LoginPage({ searchParams }: Readonly<{ searchParams: Promise<{ next?: string }> }>) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") && !next.startsWith("/login") ? next : "/dashboard";
  return <main className="grid min-h-screen place-items-center px-4 py-6"><section className="w-full max-w-md border border-ink bg-surface shadow-tactile"><div className="border-b border-ink p-5"><Link href="/" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:text-ink"><ArrowLeft className="size-3" /> Return home</Link><BrandMark className="mt-7" /></div><div className="p-5 sm:p-6"><Badge>Authenticated access</Badge><h1 className="mt-5 text-4xl font-black uppercase leading-[0.88] tracking-[-0.075em]">Enter your workspace.</h1><p className="mt-4 text-sm leading-6 text-muted">Use the password issued during account setup, or request a time-limited email link. Household access remains scoped by your Supabase identity and membership.</p><div className="mt-7 border-l-4 border-ink bg-canvas p-4 text-sm leading-6 text-muted"><LockKeyhole className="mb-3 size-5 text-ink" aria-hidden="true" />Sign-in and access checks use Supabase Auth and server-managed session cookies. Passwords are never stored by this application.</div><div className="mt-7"><PasswordSignInForm nextPath={nextPath} /></div><div className="my-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted before:h-px before:flex-1 before:bg-ink/20 after:h-px after:flex-1 after:bg-ink/20">or</div><MagicLinkForm nextPath={nextPath} /></div></section></main>;
}
