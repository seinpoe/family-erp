import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Smartphone, TableProperties } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function HomePage() {
  const configured = isSupabaseConfigured();
  return (
    <main className="min-h-screen px-4 py-4 sm:p-6"><div className="mx-auto max-w-6xl">
      <header className="flex items-center justify-between gap-4 border-b border-line pb-4"><BrandMark /><Link href={configured ? "/dashboard" : "/login"}><Button size="compact">{configured ? "Open workspace" : "Configure access"}</Button></Link></header>
      <section className="relative mt-4 grid overflow-hidden border border-line bg-surface shadow-tactile lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative p-6 sm:p-10"><div className="absolute -left-16 top-8 h-24 w-36 bg-soft" aria-hidden="true" /><div className="relative"><Badge>Family lifetime ERP</Badge><p className="mt-7 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Private household operations, made tangible.</p><h1 className="mt-3 max-w-3xl text-5xl font-black uppercase leading-[0.84] tracking-[-0.09em] sm:text-7xl">Keep life <span className="inline-block bg-brand px-2 text-white">in order.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-muted">Hearthline gives your household one secure place for people, money, home assets, schedules, private files, and obligations that need attention.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/login"><Button size="touch">Secure sign in <ArrowUpRight className="ml-2 size-4" /></Button></Link><Link href="/dashboard"><Button variant="outline" size="touch">View workspace shell</Button></Link></div></div></div>
        <aside className="relative min-h-72 border-t border-line bg-contrast p-5 text-white lg:border-l lg:border-t-0 sm:p-7"><div className="absolute right-0 top-0 h-20 w-20 bg-brand/40" aria-hidden="true" /><div className="relative space-y-3"><FeatureBlock icon={LockKeyhole} title="Policy-first privacy" copy="Household-scoped data, roles, audit events and database policies are part of the foundation." /><FeatureBlock icon={TableProperties} title="Extensible records" copy="A migration-managed PostgreSQL model supports finance, assets, calendars, documents and reminders." /><FeatureBlock icon={Smartphone} title="Mobile-shaped workflow" copy="Touch-sized controls, cards and installation metadata make daily use practical on a phone." /></div></aside>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-3"><MiniCard number="01" title="Connect" text="Set the required Vercel environment variables." /><MiniCard number="02" title="Migrate" text="Apply the included Supabase database and storage policies." /><MiniCard number="03" title="Operate" text="Authenticate, create a household, then use the module workspace." /></section>
    </div></main>
  );
}
function FeatureBlock({ icon: Icon, title, copy }: { icon: typeof LockKeyhole; title: string; copy: string }) { return <div className="border border-white/45 p-4"><Icon className="size-5 text-brand" strokeWidth={2.2} aria-hidden="true" /><h2 className="mt-5 text-lg font-black uppercase tracking-[-0.05em]">{title}</h2><p className="mt-2 text-sm leading-6 text-white/70">{copy}</p></div>; }
function MiniCard({ number, title, text }: { number: string; title: string; text: string }) { return <Card><CardContent className="p-5"><p className="font-mono text-[11px] font-bold tracking-[0.14em] text-muted">{number}</p><h2 className="mt-6 text-xl font-black uppercase tracking-[-0.05em]">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text}</p></CardContent></Card>; }
