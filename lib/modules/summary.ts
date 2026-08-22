import type { ModuleKey } from "@/components/module-workspace";

export type ModuleSnapshot = {
  label: string;
  countLabel: string;
  guidance: string;
};

export function getModuleSnapshot(module: ModuleKey, recordCount: number): ModuleSnapshot {
  const noun = recordCount === 1 ? "record" : "records";
  if (module === "family") return { label: "People snapshot", countLabel: `${recordCount} family ${noun}`, guidance: "Keep relationships and household access details current before they are needed." };
  if (module === "schedule") return { label: "Planning snapshot", countLabel: `${recordCount} planned ${recordCount === 1 ? "item" : "items"}`, guidance: "Add appointments and care commitments with a clear local start time." };
  if (module === "assets") return { label: "Asset snapshot", countLabel: `${recordCount} tracked ${recordCount === 1 ? "asset" : "assets"}`, guidance: "Record a value and renewal date where they help the household make a decision." };
  if (module === "documents") return { label: "Vault snapshot", countLabel: `${recordCount} private ${recordCount === 1 ? "file" : "files"}`, guidance: "Keep files private, searchable, and linked to the household record that explains them." };
  if (module === "reminders") return { label: "Obligation snapshot", countLabel: `${recordCount} active ${recordCount === 1 ? "reminder" : "reminders"}`, guidance: "Use a clear due time and enough lead time to make the reminder useful." };
  return { label: "Financial snapshot", countLabel: `${recordCount} financial ${noun}`, guidance: "Review movements in their recorded currency before adding a new entry." };
}
