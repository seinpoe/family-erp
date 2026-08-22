import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);
const currency = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const datetime = z.string().min(1).transform((value) => new Date(value)).refine((value) => !Number.isNaN(value.getTime()), "Use a valid date and time.");

export const familyPersonSchema = z.object({ displayName: text(160), relationship: z.string().trim().max(120).optional(), birthDate: date.optional() });
export const financialRecordSchema = z.object({ kind: z.enum(["income", "expense", "transfer", "liability"]), title: text(180), amount: z.coerce.number().nonnegative().max(99_999_999), currency, occurredOn: date, category: z.string().trim().max(120).optional() });
export const assetSchema = z.object({ name: text(180), category: text(80), estimatedValue: z.coerce.number().nonnegative().max(99_999_999).optional(), currency: currency.optional(), renewalDueAt: z.string().optional() });
export const scheduleSchema = z.object({ title: text(180), category: z.string().trim().max(80).optional(), startsAt: datetime, endsAt: datetime.optional() }).refine((value) => !value.endsAt || value.endsAt >= value.startsAt, "The event end time must not precede its start.");
export const reminderSchema = z.object({ kind: z.enum(["bill", "renewal", "appointment", "birthday", "custom"]), title: text(180), dueAt: datetime, leadTimeMinutes: z.coerce.number().int().min(0).max(525600) });
export const invitationSchema = z.object({ email: z.string().trim().email().max(320), role: z.enum(["adult", "limited"]), expiresInDays: z.coerce.number().int().min(1).max(30) });

export function firstIssue(result: { success: boolean; error?: { issues: Array<{ message: string }> } }) {
  return result.success ? null : result.error?.issues[0]?.message ?? "Check the entered values and try again.";
}
