import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleWorkspace, type ModuleKey } from "@/components/module-workspace";
import { Button } from "@/components/ui/button";
import { getActiveHouseholdContext } from "@/lib/households/context";

const modules: ModuleKey[] = ["family", "finance", "assets", "schedule", "documents", "reminders"];
export const dynamic = "force-dynamic";

async function moduleRecords(module: ModuleKey, householdId: string, context: NonNullable<Awaited<ReturnType<typeof getActiveHouseholdContext>>>, searchQuery: string) {
  const base = context.supabase;
  if (module === "family") return base.from("family_people").select("id,display_name,relationship,created_at").eq("household_id", householdId).is("deleted_at", null).order("created_at", { ascending: false }).limit(20);
  if (module === "finance") return base.from("financial_records").select("id,title,kind,amount,currency,occurred_on").eq("household_id", householdId).is("deleted_at", null).order("occurred_on", { ascending: false }).limit(20);
  if (module === "assets") return base.from("assets").select("id,name,category,estimated_value,currency,renewal_due_at").eq("household_id", householdId).is("deleted_at", null).order("created_at", { ascending: false }).limit(20);
  if (module === "schedule") return base.from("schedule_items").select("id,title,category,starts_at").eq("household_id", householdId).is("deleted_at", null).order("starts_at", { ascending: true }).limit(20);
  if (module === "documents") { const query = base.from("documents").select("id,file_name,label,mime_type,byte_size,created_at").eq("household_id", householdId).is("deleted_at", null); return searchQuery ? query.textSearch("search_vector", searchQuery, { type: "plain", config: "simple" }).order("created_at", { ascending: false }).limit(20) : query.order("created_at", { ascending: false }).limit(20); }
  return base.from("reminders").select("id,title,kind,due_at,enabled").eq("household_id", householdId).is("deleted_at", null).order("due_at", { ascending: true }).limit(20);
}

export default async function ModulePage({ params, searchParams }: { params: Promise<{ module: string }>; searchParams: Promise<{ q?: string }> }) {
  const { module } = await params;
  const { q } = await searchParams;
  if (!modules.includes(module as ModuleKey)) notFound();
  const context = await getActiveHouseholdContext();
  if (!context) return <ModuleSetupFallback module={module as ModuleKey} />;
  const searchQuery = q?.trim().slice(0, 120) ?? "";
  const result = await moduleRecords(module as ModuleKey, context.household.id, context, searchQuery);
  const memberResult = module === "family" ? await context.supabase.from("household_members").select("user_id,role").eq("household_id", context.household.id).is("deleted_at", null).limit(50) : { data: [] };
  const records = (result.data ?? []) as Record<string, unknown>[];
  const linkedRecords = module === "documents" && records.length > 0
    ? await context.supabase.from("record_links").select("source_id,target_type,target_id").eq("household_id", context.household.id).eq("source_type", "document").is("deleted_at", null).in("source_id", records.map((record) => String(record.id))).limit(100)
    : { data: [] };
  const links = (linkedRecords.data ?? []) as { source_id: string; target_type: string; target_id: string }[];
  const recordsWithLinks = module === "documents" ? records.map((record) => ({ ...record, linked_record: links.filter((link) => link.source_id === record.id).map((link) => `${link.target_type}: ${link.target_id}`).join(" · ") })) : records;
  return <ModuleWorkspace module={module as ModuleKey} householdName={context.household.name} records={recordsWithLinks} members={(memberResult.data ?? []) as { user_id: string; role: "owner" | "adult" | "limited" }[]} actorRole={context.role} searchQuery={searchQuery} />;
}

function ModuleSetupFallback({ module }: { module: ModuleKey }) {
  const meta = moduleMeta[module];
  return <main className="container py-7 sm:py-10"><section className="border border-line bg-surface p-5 shadow-tactile sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Workspace setup required</p><h1 className="mt-3 max-w-2xl text-4xl font-black uppercase leading-[0.88] tracking-[-0.07em] sm:text-6xl">Choose a household before opening {meta.title}.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted">This module never displays records without an active household. Return to the dashboard to configure Supabase access or select one of your approved household workspaces.</p><Link className="mt-6 inline-flex" href="/dashboard"><Button size="touch">Open dashboard</Button></Link></section></main>;
}

const moduleMeta: Record<ModuleKey, { title: string }> = {
  family: { title: "Family" }, finance: { title: "Finance" }, assets: { title: "Assets" }, schedule: { title: "Schedule" }, documents: { title: "Documents" }, reminders: { title: "Reminders" },
};
