import { expect, test } from "@playwright/test";

/** These drive the real agents, so they need OPENAI_API_KEY in backend/.env; without it the
 *  backend's /health says so and the suite is skipped rather than failed. */
test.describe("campaign brain", () => {
  test.beforeEach(async ({ request }) => {
    const health = (await (
      await request.get("http://localhost:8000/health")
    ).json()) as { llm_configured: boolean };
    test.skip(!health.llm_configured, "backend has no OPENAI_API_KEY");
  });

  test("a sample advertiser streams a full plan into the panels", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("mode-badge")).toContainText("agents ready");

    const chips = page.getByTestId("examples").getByRole("button");
    await expect(chips).toHaveCount(15);
    await chips.first().click();
    await expect(page.getByTestId("description")).toHaveValue(
      /premium dog food/,
    );

    await page.getByTestId("generate").click();
    await expect(page.getByTestId("run-status")).toHaveAttribute(
      "data-status",
      "done",
      { timeout: 120_000 },
    );

    await expect(page.getByTestId("brief")).toContainText("clear");
    const publishers = page.getByTestId("publishers");
    await expect(publishers).toContainText("Pawline");
    await expect(
      publishers.getByTestId("publisher-card").first(),
    ).toContainText("Recommend");
    await expect(publishers).toContainText(/Excluded \(\d+\)/);

    await expect(page.getByTestId("personas")).toContainText("The Pet Parent");
    const creatives = page
      .getByTestId("creatives")
      .getByTestId("creative-card");
    expect(await creatives.count()).toBeGreaterThanOrEqual(3);
    await expect(creatives.first()).toContainText("lint ok");

    const config = page.getByTestId("config");
    await expect(config).toContainText("draft");
    await expect(config).toContainText("Pawline");
    await config.getByRole("tab", { name: "JSON" }).click();
    await expect(config).toContainText('"publisher_allocation"');

    await expect(page.getByTestId("trace")).toContainText("stage calls");
    const stepper = page.getByTestId("stepper");
    await expect(stepper.locator('[data-stage="config"]')).toHaveAttribute(
      "data-state",
      "done",
    );

    // the run was stored: it heads the history, and clicking it reloads the same plan
    const runId = (
      await page.getByText(/^run [0-9a-f]{12}$/).textContent()
    )?.replace("run ", "");
    const history = page.getByTestId("history");
    await expect(history.getByTestId("history-row").first()).toContainText(
      /premium dog food/,
    );
    await page.getByTestId("description").fill("");
    await history.getByTestId("history-row").first().click();
    await expect(page.getByTestId("description")).toHaveValue(
      /premium dog food/,
    );
    await expect(page.getByTestId("run-status")).toHaveAttribute(
      "data-status",
      "done",
    );
    await expect(page.getByText(`run ${runId}`, { exact: true })).toBeVisible();
  });

  test("junk input stops with questions instead of a fabricated plan", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("description").fill("idk just try it");
    await page.getByTestId("generate").click();
    await expect(page.getByTestId("run-status")).toHaveAttribute(
      "data-status",
      "stopped",
      { timeout: 60_000 },
    );
    await expect(page.getByTestId("stopped")).toContainText(
      "Tell us a little more",
    );
    await expect(page.getByTestId("publishers")).toHaveCount(0);
  });

  test("an off-catalog business ends not recommended", async ({ page }) => {
    await page.goto("/");
    await page
      .getByTestId("description")
      .fill(
        "B2B SaaS for dental practices. We automate their patient recall workflow.",
      );
    await page.getByTestId("generate").click();
    await expect(page.getByTestId("run-status")).toHaveAttribute(
      "data-status",
      "done",
      { timeout: 120_000 },
    );
    await expect(page.getByTestId("publishers")).toContainText(
      "No publisher in this catalog is a defensible fit",
    );
    await expect(page.getByTestId("config")).toContainText("not recommended");
    await expect(page.getByTestId("creatives")).toHaveCount(0);
  });
});
