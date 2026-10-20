import { expect, test } from "@playwright/test";

test("opening, collection filters and a real story form one connected journey", async ({
  page,
}) => {
  await page.goto("/ko");
  await page.getByRole("button", { name: /이야기 펼치기/ }).click();
  await expect
    .poll(() =>
      page
        .locator("#stories")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(150);
  const collection = page.locator(".works-collection");
  await expect(collection.locator(".work-entry")).toHaveCount(4);
  await collection.getByRole("button", { name: "별자리 기담집" }).click();
  await expect(collection.locator(".work-entry")).toHaveCount(1);
  await collection.getByRole("link", { name: /우주공강/ }).click();
  await expect(page).toHaveURL(/\/ko\/games\/IBAT$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("우주공강");
  await expect(
    page.getByRole("button", { name: /짧은 체험 시작하기/ }),
  ).toHaveCount(0);
});

test("Habom-only experience supports both choices, replay and keyboard exit", async ({
  page,
}) => {
  await page.goto("/ko/games/sharehouse");
  const trigger = page.getByRole("button", { name: /짧은 체험 시작하기/ });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "어서오세요 셰어하우스에!" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText("인터랙션 시안 · 예시 대사", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "다음으로" }).click();
  await dialog.getByRole("button", { name: /밝게 인사를 건넨다/ }).click();
  await expect(dialog.getByText(/목소리에 담긴 작은 용기/)).toBeVisible();
  await dialog.getByRole("button", { name: /다시 선택하기/ }).click();
  await dialog
    .getByRole("button", { name: /조심스럽게 문을 두드린다/ })
    .click();
  await expect(dialog.getByText(/작은 노크 뒤로/)).toBeVisible();
  await dialog.getByRole("button", { name: "다음으로" }).click();
  await expect(dialog.getByText("같은 시작, 조금 다른 이야기.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.goto("/ko/games/memorial-circuit");
  await expect(
    page.getByRole("button", { name: /짧은 체험 시작하기/ }),
  ).toHaveCount(0);
});

test("mobile menu and language switching preserve navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ko");
  const menu = page.getByTestId("mobile-menu-button");
  await menu.click();
  await expect(page.getByTestId("mobile-menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
  await expect(menu).toBeFocused();
  await menu.click();
  await page
    .getByTestId("mobile-menu")
    .getByRole("link", { name: /작품/ })
    .click();
  await expect(page).toHaveURL(/\/ko\/games$/);
  await page.getByLabel("언어 선택").selectOption("en");
  await expect(page).toHaveURL(/\/en\/games$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Our stories.",
  );
});

for (const width of [320, 768, 1440]) {
  test(`key designs remain usable without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of [
      "/ko",
      "/en",
      "/ja",
      "/ko/habom",
      "/ko/games/sharehouse",
    ]) {
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status(), route).toBe(200);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      expect(
        await page
          .locator("img")
          .evaluateAll((images) =>
            images
              .filter((image) => image.complete && !image.naturalWidth)
              .map((image) => image.src),
          ),
        route,
      ).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}
