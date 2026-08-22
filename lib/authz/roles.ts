export const householdRoles = ["owner", "adult", "limited"] as const;

export type HouseholdRole = (typeof householdRoles)[number];

export function isHouseholdRole(role: string): role is HouseholdRole {
  return householdRoles.some((householdRole) => householdRole === role);
}

const roleCapabilities: Record<HouseholdRole, readonly string[]> = {
  owner: ["manage_household", "manage_members", "manage_finance", "manage_documents", "manage_schedule"],
  adult: ["manage_finance", "manage_documents", "manage_schedule"],
  limited: ["view_workspace"],
};

export function can(role: HouseholdRole, capability: string) {
  return roleCapabilities[role].includes(capability);
}

export function canManageMembers(role: HouseholdRole) {
  return can(role, "manage_members");
}

export function canWriteOperationalRecords(role: HouseholdRole) {
  return can(role, "manage_finance") || can(role, "manage_documents") || can(role, "manage_schedule");
}
