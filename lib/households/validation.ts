import { z } from "zod";

export const householdSetupSchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters for the household name.").max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens only.").min(2).max(80),
  timezone: z.string().trim().min(1).max(64),
  baseCurrency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Use a three-letter currency code."),
});

export type HouseholdSetupInput = z.infer<typeof householdSetupSchema>;
