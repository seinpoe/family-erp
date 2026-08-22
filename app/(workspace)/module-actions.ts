"use server";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActiveHouseholdContext } from "@/lib/households/context";
import { assetSchema, familyPersonSchema, financialRecordSchema, firstIssue, invitationSchema, reminderSchema, scheduleSchema } from "@/lib/modules/validation";

export type ModuleActionState = { status: "idle" | "success" | "error"; message: string; shareCode?: string };
const idle: ModuleActionState = { status: "idle", message: "" };
export const initialModuleActionState = idle;

async function householdContextOrError() {
  const context = await getActiveHouseholdContext();
  return context ?? null;
}

function resultFor(error: unknown, success: string): ModuleActionState {
  return error ? { status: "error", message: "The change could not be saved. Check your access and try again." } : { status: "success", message: success };
}

export async function createFamilyPerson(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const parsed = familyPersonSchema.safeParse({ displayName: formData.get("displayName"), relationship: formData.get("relationship") || undefined, birthDate: formData.get("birthDate") || undefined });
  if (!parsed.success) return { status: "error", message: firstIssue(parsed)! };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Select a household and sign in before adding family records." };
  const { error } = await context.supabase.from("family_people").insert({ household_id: context.household.id, display_name: parsed.data.displayName, relationship: parsed.data.relationship ?? null, birth_date: parsed.data.birthDate ?? null, created_by: context.user.id });
  revalidatePath("/family"); revalidatePath("/dashboard");
  return resultFor(error, "Family record added.");
}

export async function createFinancialRecord(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const parsed = financialRecordSchema.safeParse({ kind: formData.get("kind"), title: formData.get("title"), amount: formData.get("amount"), currency: formData.get("currency"), occurredOn: formData.get("occurredOn"), category: formData.get("category") || undefined });
  if (!parsed.success) return { status: "error", message: firstIssue(parsed)! };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Select a household and sign in before adding financial records." };
  const { error } = await context.supabase.from("financial_records").insert({ household_id: context.household.id, kind: parsed.data.kind, title: parsed.data.title, amount: parsed.data.amount, currency: parsed.data.currency, occurred_on: parsed.data.occurredOn, category: parsed.data.category ?? null, created_by: context.user.id });
  revalidatePath("/finance"); revalidatePath("/dashboard");
  return resultFor(error, "Financial record added.");
}

export async function createAsset(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const parsed = assetSchema.safeParse({ name: formData.get("name"), category: formData.get("category"), estimatedValue: formData.get("estimatedValue") || undefined, currency: formData.get("currency") || undefined, renewalDueAt: formData.get("renewalDueAt") || undefined });
  if (!parsed.success) return { status: "error", message: firstIssue(parsed)! };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Select a household and sign in before adding assets." };
  const { error } = await context.supabase.from("assets").insert({ household_id: context.household.id, name: parsed.data.name, category: parsed.data.category, estimated_value: parsed.data.estimatedValue ?? null, currency: parsed.data.currency ?? context.household.base_currency, renewal_due_at: parsed.data.renewalDueAt ? new Date(parsed.data.renewalDueAt).toISOString() : null, created_by: context.user.id });
  revalidatePath("/assets"); revalidatePath("/dashboard");
  return resultFor(error, "Asset added.");
}

export async function createScheduleItem(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const parsed = scheduleSchema.safeParse({ title: formData.get("title"), category: formData.get("category") || undefined, startsAt: formData.get("startsAt"), endsAt: formData.get("endsAt") || undefined });
  if (!parsed.success) return { status: "error", message: firstIssue(parsed)! };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Select a household and sign in before adding schedule items." };
  const { error } = await context.supabase.from("schedule_items").insert({ household_id: context.household.id, title: parsed.data.title, category: parsed.data.category ?? "general", starts_at: parsed.data.startsAt.toISOString(), ends_at: parsed.data.endsAt?.toISOString() ?? null, timezone: context.household.timezone, created_by: context.user.id });
  revalidatePath("/schedule"); revalidatePath("/dashboard");
  return resultFor(error, "Schedule item added.");
}

export async function createReminder(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const parsed = reminderSchema.safeParse({ kind: formData.get("kind"), title: formData.get("title"), dueAt: formData.get("dueAt"), leadTimeMinutes: formData.get("leadTimeMinutes") });
  if (!parsed.success) return { status: "error", message: firstIssue(parsed)! };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Select a household and sign in before adding reminders." };
  const { error } = await context.supabase.from("reminders").insert({ household_id: context.household.id, kind: parsed.data.kind, title: parsed.data.title, due_at: parsed.data.dueAt.toISOString(), timezone: context.household.timezone, lead_time_minutes: parsed.data.leadTimeMinutes, next_trigger_at: new Date(parsed.data.dueAt.getTime() - parsed.data.leadTimeMinutes * 60_000).toISOString(), created_by: context.user.id });
  revalidatePath("/reminders"); revalidatePath("/dashboard");
  return resultFor(error, "Reminder scheduled.");
}

export async function createInvitation(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const parsed = invitationSchema.safeParse({ email: formData.get("email"), role: formData.get("role"), expiresInDays: formData.get("expiresInDays") });
  if (!parsed.success) return { status: "error", message: firstIssue(parsed)! };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Select a household and sign in before inviting a member." };
  const code = randomBytes(24).toString("base64url");
  const { error } = await context.supabase.from("household_invitations").insert({ household_id: context.household.id, email: parsed.data.email, role: parsed.data.role, token_hash: createHash("sha256").update(code).digest("hex"), invited_by: context.user.id, expires_at: new Date(Date.now() + parsed.data.expiresInDays * 86_400_000).toISOString() });
  revalidatePath("/family");
  return error ? resultFor(error, "") : { status: "success", message: "Invitation created. Share the one-time code through a private channel.", shareCode: code };
}

export async function acceptHouseholdInvitation(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const code = String(formData.get("code") ?? "").trim();
  if (code.length < 20) return { status: "error", message: "Enter the invitation code you received." };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Sign in before accepting a household invitation." };
  const { error } = await context.supabase.rpc("accept_household_invitation", { p_token: code });
  revalidatePath("/dashboard");
  return resultFor(error, "Invitation accepted. Your household workspace is ready.");
}

export async function updateMemberRole(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const memberId = z.string().uuid().safeParse(formData.get("memberId"));
  const role = z.enum(["adult", "limited"]).safeParse(formData.get("role"));
  if (!memberId.success || !role.success) return { status: "error", message: "Choose a valid member and a permitted role." };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Sign in before changing member roles." };
  const { error } = await context.supabase.from("household_members").update({ role: role.data }).eq("household_id", context.household.id).eq("user_id", memberId.data);
  revalidatePath("/family"); revalidatePath("/dashboard");
  return resultFor(error, "Member role updated.");
}

export async function uploadDocument(_state: ModuleActionState, formData: FormData): Promise<ModuleActionState> {
  const file = formData.get("file");
  const label = String(formData.get("label") ?? "").trim().slice(0, 180);
  const relatedType = String(formData.get("relatedType") ?? "").trim().slice(0, 80);
  const relatedId = z.string().uuid().safeParse(formData.get("relatedId"));
  if (relatedType && !relatedId.success) return { status: "error", message: "Provide a valid related record ID or leave the relationship blank." };
  if (!(file instanceof File) || file.size < 1 || file.size > 52_428_800) return { status: "error", message: "Choose a file no larger than 50 MB." };
  if (!new Set(["application/pdf", "image/jpeg", "image/png", "text/plain"]).has(file.type)) return { status: "error", message: "Use a PDF, JPEG, PNG, or plain-text file." };
  const context = await householdContextOrError();
  if (!context) return { status: "error", message: "Select a household and sign in before uploading documents." };
  const linkTargets = { family_person: "family_people", financial_record: "financial_records", asset: "assets", schedule_item: "schedule_items", reminder: "reminders" } as const;
  const targetType = z.enum(["family_person", "financial_record", "asset", "schedule_item", "reminder"]).safeParse(relatedType || undefined);
  if (relatedType && !targetType.success) return { status: "error", message: "Choose a supported related record type." };
  if (targetType.success && relatedId.success) {
    const targetTable = linkTargets[targetType.data];
    const { data: target, error: targetError } = await context.supabase.from(targetTable).select("id").eq("id", relatedId.data).eq("household_id", context.household.id).is("deleted_at", null).maybeSingle();
    if (targetError || !target) return { status: "error", message: "The related record was not found in your active household." };
  }
  const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "-").slice(-180);
  const storagePath = `${context.household.id}/${randomUUID()}-${safeName}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await context.supabase.storage.from("family-documents").upload(storagePath, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return resultFor(uploadError, "");
  const { data: document, error: metadataError } = await context.supabase.from("documents").insert({ household_id: context.household.id, storage_path: storagePath, file_name: file.name.slice(0, 255), mime_type: file.type, byte_size: file.size, label: label || null, searchable_text: `${file.name} ${label}`, created_by: context.user.id }).select("id").single();
  if (metadataError || !document) { await context.supabase.storage.from("family-documents").remove([storagePath]); return resultFor(metadataError ?? new Error("Document metadata was unavailable."), ""); }
  if (targetType.success && relatedId.success) {
    const { error: linkError } = await context.supabase.from("record_links").insert({ household_id: context.household.id, source_type: "document", source_id: document.id, target_type: targetType.data, target_id: relatedId.data, relation_type: "attached_to", created_by: context.user.id });
    if (linkError) {
      await Promise.all([
        context.supabase.storage.from("family-documents").remove([storagePath]),
        context.supabase.from("documents").update({ deleted_at: new Date().toISOString(), retention_until: new Date().toISOString() }).eq("id", document.id as string),
      ]);
      return { status: "error", message: "The document link could not be saved, so the upload was rolled back." };
    }
  }
  revalidatePath("/documents"); revalidatePath("/dashboard");
  return { status: "success", message: "Document uploaded to your private vault." };
}
