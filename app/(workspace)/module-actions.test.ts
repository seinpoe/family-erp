import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/households/context", () => ({ getActiveHouseholdContext: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { getActiveHouseholdContext } from "@/lib/households/context";
import { acceptHouseholdInvitation, createAsset, createFamilyPerson, createFinancialRecord, createInvitation, createReminder, createScheduleItem, initialModuleActionState, uploadDocument } from "@/app/(workspace)/module-actions";

const household = { id: "c4115678-c321-4444-8f11-1f1111111111", base_currency: "USD", timezone: "UTC", name: "Family" };
const user = { id: "a1111111-b222-4333-8444-555555555555" };
type Fixture = { user: typeof user; household: typeof household; supabase: { from: ReturnType<typeof vi.fn>; rpc: ReturnType<typeof vi.fn>; storage: { from: ReturnType<typeof vi.fn> } } };

function form(values: Record<string, string>) { const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data; }
function contextWith(input: { insertError?: Error | null; rpcError?: Error | null } = {}): Fixture {
  const insert = vi.fn().mockResolvedValue({ error: input.insertError ?? null });
  const rpc = vi.fn().mockResolvedValue({ error: input.rpcError ?? null });
  const documentInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { id: "b2222222-c333-4444-8555-666666666666" }, error: input.insertError ?? null }) })) }));
  const storage = { from: vi.fn(() => ({ upload: vi.fn().mockResolvedValue({ error: input.insertError ?? null }), remove: vi.fn().mockResolvedValue({ error: null }) })) };
  return { user, household, supabase: { from: vi.fn((table: string) => table === "documents" ? { insert: documentInsert } : { insert }), rpc, storage } };
}
afterEach(() => vi.clearAllMocks());

describe("RLS-backed ERP module actions", () => {
  it("rejects a family record when no active household context is available", async () => {
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(null);
    await expect(createFamilyPerson(initialModuleActionState, form({ displayName: "Mya", relationship: "Child" }))).resolves.toMatchObject({ status: "error" });
  });

  it("sends valid family, finance, and reminder records through the active household client", async () => {
    const context = contextWith();
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(context as never);
    await expect(createFamilyPerson(initialModuleActionState, form({ displayName: "Mya", relationship: "Child" }))).resolves.toMatchObject({ status: "success" });
    await expect(createFinancialRecord(initialModuleActionState, form({ kind: "expense", title: "Groceries", amount: "42.50", currency: "usd", occurredOn: "2026-08-22" }))).resolves.toMatchObject({ status: "success" });
    await expect(createReminder(initialModuleActionState, form({ kind: "bill", title: "Internet", dueAt: "2026-08-23T10:00", leadTimeMinutes: "60" }))).resolves.toMatchObject({ status: "success" });
    expect(context.supabase.from).toHaveBeenCalledWith("family_people");
    expect(context.supabase.from).toHaveBeenCalledWith("financial_records");
    expect(context.supabase.from).toHaveBeenCalledWith("reminders");
  });

  it("surfaces RLS-denied writes for family, finance, and reminder records", async () => {
    const denied = contextWith({ insertError: new Error("RLS policy denied") });
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(denied as never);
    await expect(createFamilyPerson(initialModuleActionState, form({ displayName: "Mya", relationship: "Child" }))).resolves.toMatchObject({ status: "error" });
    await expect(createFinancialRecord(initialModuleActionState, form({ kind: "expense", title: "Groceries", amount: "42.50", currency: "usd", occurredOn: "2026-08-22" }))).resolves.toMatchObject({ status: "error" });
    await expect(createReminder(initialModuleActionState, form({ kind: "bill", title: "Internet", dueAt: "2026-08-23T10:00", leadTimeMinutes: "60" }))).resolves.toMatchObject({ status: "error" });
  });

  it("handles allowed assets, schedules, and private document metadata writes", async () => {
    const context = contextWith();
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(context as never);
    await expect(createAsset(initialModuleActionState, form({ name: "Car", category: "vehicle", estimatedValue: "8000", currency: "USD" }))).resolves.toMatchObject({ status: "success" });
    await expect(createScheduleItem(initialModuleActionState, form({ title: "Dental checkup", category: "care", startsAt: "2026-08-24T10:00" }))).resolves.toMatchObject({ status: "success" });
    const fileForm = form({ label: "Policy" });
    fileForm.set("file", new File(["private text"], "policy.txt", { type: "text/plain" }));
    await expect(uploadDocument(initialModuleActionState, fileForm)).resolves.toMatchObject({ status: "success" });
    expect(context.supabase.from).toHaveBeenCalledWith("assets");
    expect(context.supabase.from).toHaveBeenCalledWith("schedule_items");
    expect(context.supabase.storage.from).toHaveBeenCalledWith("family-documents");
  });

  it("denies asset creation without a household context", async () => {
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(null);
    await expect(createAsset(initialModuleActionState, form({ name: "Car", category: "vehicle" }))).resolves.toMatchObject({ status: "error" });
  });

  it("surfaces RLS-denied writes for assets, schedules, and document storage", async () => {
    const denied = contextWith({ insertError: new Error("RLS policy denied") });
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(denied as never);
    await expect(createAsset(initialModuleActionState, form({ name: "Car", category: "vehicle" }))).resolves.toMatchObject({ status: "error" });
    await expect(createScheduleItem(initialModuleActionState, form({ title: "Dental checkup", startsAt: "2026-08-24T10:00" }))).resolves.toMatchObject({ status: "error" });
    const fileForm = form({ label: "Denied policy" });
    fileForm.set("file", new File(["private text"], "policy.txt", { type: "text/plain" }));
    await expect(uploadDocument(initialModuleActionState, fileForm)).resolves.toMatchObject({ status: "error" });
  });

  it("surfaces a denied owner-only invitation creation write", async () => {
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(contextWith({ insertError: new Error("RLS policy denied") }) as never);
    await expect(createInvitation(initialModuleActionState, form({ email: "member@example.com", role: "adult", expiresInDays: "7" }))).resolves.toMatchObject({ status: "error" });
  });

  it("returns a one-time share code after an allowed invitation write", async () => {
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(contextWith() as never);
    const result = await createInvitation(initialModuleActionState, form({ email: "member@example.com", role: "adult", expiresInDays: "7" }));
    expect(result.status).toBe("success");
    expect(result.shareCode).toEqual(expect.any(String));
  });

  it("accepts an invitation only when the authenticated RPC succeeds", async () => {
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(contextWith() as never);
    await expect(acceptHouseholdInvitation(initialModuleActionState, form({ code: "a-secure-one-time-code-with-enough-length" }))).resolves.toMatchObject({ status: "success" });
    vi.mocked(getActiveHouseholdContext).mockResolvedValue(contextWith({ rpcError: new Error("invalid invitation") }) as never);
    await expect(acceptHouseholdInvitation(initialModuleActionState, form({ code: "a-secure-one-time-code-with-enough-length" }))).resolves.toMatchObject({ status: "error" });
  });
});
