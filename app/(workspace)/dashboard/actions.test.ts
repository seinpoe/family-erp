import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { chooseActiveHousehold, type HouseholdSwitchState } from "@/app/(workspace)/dashboard/actions";

const validHouseholdId = "de305d54-75b4-431b-adb2-eb6b9e546014";
const user = { id: "1c5b2bf0-1d07-46f7-97f4-10c21e801204" };
const initialState: HouseholdSwitchState = { status: "idle", message: "" };

function formFor(householdId = validHouseholdId) {
  const formData = new FormData();
  formData.set("householdId", householdId);
  return formData;
}

function supabaseFixture(input: {
  signedIn?: boolean;
  membership?: { household_id: string } | null;
  membershipError?: Error | null;
  update?: { active_household_id: string } | null;
  updateError?: Error | null;
}) {
  const membershipResult = { data: input.membership ?? null, error: input.membershipError ?? null };
  const updateResult = { data: input.update ?? null, error: input.updateError ?? null };
  const memberMaybeSingle = vi.fn().mockResolvedValue(membershipResult);
  const updateMaybeSingle = vi.fn().mockResolvedValue(updateResult);

  const memberIs = vi.fn(() => ({ maybeSingle: memberMaybeSingle }));
  const memberSecondEq = vi.fn(() => ({ is: memberIs }));
  const memberFirstEq = vi.fn(() => ({ eq: memberSecondEq }));
  const profileSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
  const profileEq = vi.fn(() => ({ select: profileSelect }));
  const profileUpdate = vi.fn(() => ({ eq: profileEq }));

  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: input.signedIn === false ? null : user } }) },
    from: vi.fn((table: string) => table === "household_members"
      ? { select: vi.fn(() => ({ eq: memberFirstEq })) }
      : { update: profileUpdate }),
  } as never;
}

afterEach(() => vi.clearAllMocks());

describe("chooseActiveHousehold", () => {
  it("rejects malformed household IDs before calling Supabase", async () => {
    const result = await chooseActiveHousehold(initialState, formFor("not-a-uuid"));
    expect(result).toEqual({ status: "error", message: "The selected household is invalid." });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("requires an authenticated user", async () => {
    vi.mocked(createClient).mockResolvedValue(supabaseFixture({ signedIn: false }));
    await expect(chooseActiveHousehold(initialState, formFor())).resolves.toEqual({
      status: "error",
      message: "Sign in before changing your active household.",
    });
  });

  it("returns an access error when RLS membership lookup has no row", async () => {
    vi.mocked(createClient).mockResolvedValue(supabaseFixture({ membership: null }));
    await expect(chooseActiveHousehold(initialState, formFor())).resolves.toEqual({
      status: "error",
      message: "You no longer have access to that household.",
    });
  });

  it("surfaces a profile update failure such as an RLS-denied write", async () => {
    vi.mocked(createClient).mockResolvedValue(supabaseFixture({
      membership: { household_id: validHouseholdId },
      updateError: new Error("new row violates row-level security policy"),
    }));
    await expect(chooseActiveHousehold(initialState, formFor())).resolves.toEqual({
      status: "error",
      message: "Your active household could not be saved. Please try again.",
    });
  });

  it("confirms the persisted active household and revalidates the dashboard", async () => {
    vi.mocked(createClient).mockResolvedValue(supabaseFixture({
      membership: { household_id: validHouseholdId },
      update: { active_household_id: validHouseholdId },
    }));
    await expect(chooseActiveHousehold(initialState, formFor())).resolves.toEqual({
      status: "success",
      message: "Active household updated.",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
