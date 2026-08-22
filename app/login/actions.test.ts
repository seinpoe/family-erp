import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/lib/supabase/server";
import { signInWithPassword, type PasswordLoginState } from "@/app/login/actions";

const initialState: PasswordLoginState = { status: "idle", message: "" };

function passwordForm(email = "person@example.com", password = "correct-password") {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  formData.set("next", "/finance");
  return formData;
}

afterEach(() => vi.clearAllMocks());

describe("signInWithPassword", () => {
  it("rejects invalid input before using Supabase", async () => {
    await expect(signInWithPassword(initialState, passwordForm("not-an-email"))).resolves.toEqual({ status: "error", message: "Enter a valid email address." });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("keeps credential failures generic", async () => {
    vi.mocked(createClient).mockResolvedValue({ auth: { signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("Invalid login credentials") }) } } as never);
    await expect(signInWithPassword(initialState, passwordForm())).resolves.toEqual({ status: "error", message: "Email or password is incorrect." });
  });

  it("creates a Supabase session and only redirects to a safe internal path", async () => {
    const passwordSignIn = vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    vi.mocked(createClient).mockResolvedValue({ auth: { signInWithPassword: passwordSignIn } } as never);
    await expect(signInWithPassword(initialState, passwordForm())).resolves.toEqual({ status: "success", message: "Signed in. Opening your workspace…", redirectTo: "/finance" });
    expect(passwordSignIn).toHaveBeenCalledWith({ email: "person@example.com", password: "correct-password" });
  });

  it("rejects an external redirect target", async () => {
    const passwordSignIn = vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    vi.mocked(createClient).mockResolvedValue({ auth: { signInWithPassword: passwordSignIn } } as never);
    const formData = passwordForm();
    formData.set("next", "//untrusted.example");
    await expect(signInWithPassword(initialState, formData)).resolves.toMatchObject({ status: "success", redirectTo: "/dashboard" });
  });
});
