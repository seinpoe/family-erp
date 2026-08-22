import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center px-4 py-6"><section className="w-full max-w-md border border-ink bg-surface shadow-tactile"><div className="border-b border-ink p-5"><Link href="/" className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:text-ink"><ArrowLeft className="size-3" /> Return home</Link><BrandMark className="mt-7" /></div><div className="p-5 sm:p-6"><Badge>Authenticated access</Badge><h1 className="mt-5 text-4xl font-black uppercase leading-[0.88] tracking-[-0.075em]">Enter your workspace.</h1><p className="mt-4 text-sm leading-6 text-muted">We use a time-limited email link instead of a reusable password. Your account is then scoped to the households you belong to.</p><div className="mt-7 border-l-4 border-ink bg-canvas p-4 text-sm leading-6 text-muted"><LockKeyhole className="mb-3 size-5 text-ink" aria-hidden="true" />Sign-in and access checks use Supabase Auth and server-managed session cookies.</div><div className="mt-7"><MagicLinkForm /></div></div></section></main>;
}
