import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/lib/supabase/server";
import { changePassword, type PasswordChangeState } from "@/app/(workspace)/account/security/actions";

const initialState: PasswordChangeState = { status: "idle", message: "" };
type PasswordAuthFixture = {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
  };
};

function passwordForm(input: Partial<{ currentPassword: string; newPassword: string; confirmation: string }> = {}) {
  const formData = new FormData();
  formData.set("currentPassword", input.currentPassword ?? "current-password");
  formData.set("newPassword", input.newPassword ?? "a-secure-new-password");
  formData.set("confirmation", input.confirmation ?? "a-secure-new-password");
  return formData;
}

function fixture(input: { user?: { email?: string } | null; verificationError?: Error | null; updateError?: Error | null } = {}): PasswordAuthFixture {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: input.user === undefined ? { email: "person@example.com" } : input.user } }), signInWithPassword: vi.fn().mockResolvedValue({ error: input.verificationError ?? null }), updateUser: vi.fn().mockResolvedValue({ error: input.updateError ?? null }) } };
}

afterEach(() => vi.clearAllMocks());

describe("changePassword", () => {
  it("validates matching, sufficiently long new passwords before contacting Supabase", async () => {
    await expect(changePassword(initialState, passwordForm({ newPassword: "short", confirmation: "short" }))).resolves.toEqual({ status: "error", message: "Use at least 12 characters for your new password." });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("requires an authenticated user", async () => {
    vi.mocked(createClient).mockResolvedValue(fixture({ user: null }) as never);
    await expect(changePassword(initialState, passwordForm())).resolves.toEqual({ status: "error", message: "Sign in before changing your password." });
  });

  it("requires the current password before updating", async () => {
    const supabase = fixture({ verificationError: new Error("invalid login credentials") });
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    await expect(changePassword(initialState, passwordForm())).resolves.toEqual({ status: "error", message: "Your current password is incorrect." });
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates an authenticated user password without returning sensitive values", async () => {
    const supabase = fixture();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    await expect(changePassword(initialState, passwordForm())).resolves.toEqual({ status: "success", message: "Password updated. Keep it private and use it for your next sign-in." });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: "person@example.com", password: "current-password" });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "a-secure-new-password" });
  });
});
