import { afterEach, describe, expect, it } from "vitest";
import { requireServiceRoleConfig } from "@/lib/supabase/admin";

const initialUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const initialServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

afterEach(() => {
  if (initialUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = initialUrl;
  if (initialServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = initialServiceRoleKey;
});

describe("server-only Supabase configuration", () => {
  it("fails closed when the service role key is absent", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(requireServiceRoleConfig).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("returns elevated configuration only when every server variable is provided", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-test-key";
    expect(requireServiceRoleConfig()).toEqual({
      url: "https://example.supabase.co",
      serviceRoleKey: "server-test-key",
    });
  });
});
