import { describe, expect, it } from "vitest";
import WorkspaceLoading from "@/app/(workspace)/loading";

describe("workspace loading shell", () => {
  it("renders an accessible busy landmark while authenticated data is loading", () => {
    const element = WorkspaceLoading();
    expect(element.props["aria-busy"]).toBe("true");
    expect(element.props["aria-label"]).toBe("Loading household workspace");
  });
});
