import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("health endpoint", () => {
  it("returns a non-cacheable, non-indexable operational response", async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    await expect(response.json()).resolves.toMatchObject({ status: "ok", service: "family-lifetime-erp" });
  });
});
