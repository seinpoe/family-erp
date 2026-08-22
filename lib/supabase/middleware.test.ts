import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));
vi.mock("@/lib/supabase/config", () => ({ getSupabasePublicConfig: vi.fn(() => ({ url: "https://example.supabase.co", anonKey: "public-key" })) }));

import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { loginRedirectPath, requiresAuthentication, updateSession } from "@/lib/supabase/middleware";

afterEach(() => vi.clearAllMocks());

describe("configured dashboard route protection", () => {
  it("marks dashboard paths as authenticated routes and preserves the intended destination", () => {
    expect(requiresAuthentication("/dashboard")).toBe(true);
    expect(requiresAuthentication("/dashboard/finance")).toBe(true);
    expect(requiresAuthentication("/finance")).toBe(true);
    expect(requiresAuthentication("/documents")).toBe(true);
    expect(requiresAuthentication("/")).toBe(false);
    expect(loginRedirectPath("/dashboard/finance")).toBe("/login?next=%2Fdashboard%2Ffinance");
  });

  it("returns an actual login redirect for a signed-out protected route", async () => {
    vi.mocked(createServerClient).mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } } as never);
    const response = await updateSession(new NextRequest("https://example.test/finance"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/login?next=%2Ffinance");
  });

  it("redirects a configured signed-out dashboard request directly to login", async () => {
    vi.mocked(createServerClient).mockReturnValue({ auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) } } as never);
    const response = await updateSession(new NextRequest("https://example.test/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/login?next=%2Fdashboard");
  });
});
