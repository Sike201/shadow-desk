import { test, expect } from "@playwright/test";
import { Keypair } from "@solana/web3.js";

async function waitForApp(page: import("@playwright/test").Page) {
  await expect(
    page.getByRole("heading", { name: "Incognito mode for your money." })
  ).toBeVisible({ timeout: 30_000 });
}

test.describe("Shadow Send UI", () => {
  test("loads main send screen", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
    await expect(page.getByRole("button", { name: "Send Privately" })).toBeEnabled();
    await expect(page.getByText("Connect a wallet with Privy to send")).toBeVisible();
  });

  test("token selector and private send toggle", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
    await page.getByRole("button", { name: "USDC" }).click();
    await expect(page.getByText("Extra Mix", { exact: false })).toBeVisible();

    await page.getByRole("switch").click();
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeVisible();
    await expect(page.getByText("Extra Mix", { exact: false })).toHaveCount(0);

    await page.getByRole("switch").click();
    await page.getByRole("button", { name: "SOL" }).click();
    await expect(page.getByText("Extra Mix", { exact: false })).toHaveCount(0);
  });

  test("Privy connect button visible", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Connect wallet" })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("requires wallet before send", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("0").fill("0.01");
    await page
      .getByPlaceholder("Wallet address")
      .fill(Keypair.generate().publicKey.toBase58());
    await page.getByRole("button", { name: "Send Privately" }).click();

    await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Connect your wallet first")).toBeVisible();
  });

  test("validates recipient address", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("0").fill("0.01");
    await page.getByPlaceholder("Wallet address").fill("not-a-valid-address");
    await page.getByRole("button", { name: "Send Privately" }).click();

    await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Invalid recipient address")).toBeVisible();
  });

  test("public send mode shows network fee estimate", async ({ page }) => {
    await page.goto("/");
    await waitForApp(page);
    await page.getByRole("switch").click();
    await expect(page.getByText(/Est\. fee · ~0\.000005 SOL network/)).toBeVisible();
    await expect(page.getByText("~30 sec")).toBeVisible();
  });

  test("no critical asset 404 on load", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (res) => {
      const url = res.url();
      if (
        res.status() === 404 &&
        (url.includes("/_next/static/") || url.endsWith(".css") || url.endsWith(".js"))
      ) {
        failed.push(url);
      }
    });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Incognito mode for your money." })
    ).toBeVisible();
    expect(failed).toEqual([]);
  });
});
