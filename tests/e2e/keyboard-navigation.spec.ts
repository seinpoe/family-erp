import { expect, test, type Page } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

async function collectFocusedLabels(page: Page) {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element) return { label: "", tag: "", href: "", outlineWidth: "0px" };
    const style = window.getComputedStyle(element);
    return {
      label: element.getAttribute("aria-label") || element.textContent?.replace(/\s+/g, " ").trim() || "",
      tag: element.tagName,
      href: element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "",
      outlineWidth: style.outlineWidth,
    };
  });
}

async function tabUntil(page: Page, label: string) {
  return tabUntilMatch(page, (focused) => focused.label.includes(label), label);
}

async function tabUntilMatch(page: Page, matches: (focused: Awaited<ReturnType<typeof collectFocusedLabels>>) => boolean, description: string) {
  for (let index = 0; index < 18; index += 1) {
    await page.keyboard.press("Tab");
    const focused = await collectFocusedLabels(page);
    if (matches(focused)) return focused;
  }
  throw new Error(`Could not reach ${description} using keyboard navigation.`);
}

for (const viewport of [{ name: "mobile", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 720 }]) {
  test.describe(`${viewport.name} keyboard navigation`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("keeps public primary action reachable with a visible keyboard focus indicator", async ({ page }) => {
      await page.goto(`${baseURL}/?theme=dark`);
      const focused = await tabUntil(page, "Configure access");
      expect(focused.tag).toBe("A");
      expect(focused.outlineWidth).toBe("3px");
    });

    test("keeps dashboard and module recovery actions reachable without a pointer", async ({ page }) => {
      await page.goto(`${baseURL}/dashboard?theme=dark`);
      const dashboardFocus = await tabUntil(page, "Home");
      expect(dashboardFocus.tag).toBe("A");
      expect(dashboardFocus.outlineWidth).toBe("3px");

      const dashboardTask = await tabUntilMatch(page, (focused) => focused.href === "/finance" && focused.label.includes("Finance"), "Finance dashboard task");
      expect(dashboardTask.href).toBe("/finance");
      expect(dashboardTask.outlineWidth).toBe("3px");

      for (const moduleKey of ["family", "finance", "assets", "schedule", "documents", "reminders"]) {
        await page.goto(`${baseURL}/${moduleKey}?theme=dark`);
        await page.getByRole("link", { name: "Open dashboard" }).waitFor({ state: "visible", timeout: 10_000 });
        const moduleFocus = await tabUntilMatch(page, (focused) => focused.href === "/dashboard" && focused.label.includes("Open dashboard"), `${moduleKey} recovery action`);
        expect(moduleFocus.tag).toBe("A");
        expect(moduleFocus.href).toBe("/dashboard");
        expect(moduleFocus.outlineWidth).toBe("3px");
      }
    });
  });
}
