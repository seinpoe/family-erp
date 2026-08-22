export function activeHouseholdUpdateSucceeded(updatedHouseholdId: string | null | undefined, requestedHouseholdId: string) {
  return updatedHouseholdId === requestedHouseholdId;
}

export function activeHouseholdPersistenceError(input: {
  hasMembership: boolean;
  membershipFailed: boolean;
  updateFailed: boolean;
  persistedHouseholdId: string | null | undefined;
  requestedHouseholdId: string;
}) {
  if (input.membershipFailed || !input.hasMembership) return "You no longer have access to that household.";
  if (input.updateFailed || !activeHouseholdUpdateSucceeded(input.persistedHouseholdId, input.requestedHouseholdId)) {
    return "Your active household could not be saved. Please try again.";
  }
  return null;
}
