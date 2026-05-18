import { expect, test } from "@playwright/test";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface StoryEntry {
  id: string;
  title: string;
  name: string;
  type: string;
  tags?: string[];
}

interface StorybookIndex {
  entries: Record<string, StoryEntry>;
}

const indexPath = join(__dirname, "../storybook-static/index.json");
const index: StorybookIndex = JSON.parse(readFileSync(indexPath, "utf-8"));

const stories = Object.values(index.entries).filter(
  (entry) => entry.type === "story",
);

for (const story of stories) {
  test(`VRT: ${story.title} / ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);

    await page.locator("#storybook-root > *").first().waitFor();

    if (story.tags?.includes("play-fn")) {
      await page.waitForTimeout(500);
    }

    await expect(page).toHaveScreenshot(`${story.id}.png`);
  });
}
