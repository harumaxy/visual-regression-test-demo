import { expect, test } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

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

// Read stories from built Storybook's index.json
const indexPath = join(__dirname, "../storybook-static/index.json");
const index: StorybookIndex = JSON.parse(readFileSync(indexPath, "utf-8"));

const stories = Object.values(index.entries).filter(
  (entry) => entry.type === "story",
);

for (const story of stories) {
  test(`VRT: ${story.title} / ${story.name}`, async ({ page }) => {
    // Navigate to the story's iframe
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);

    // Wait for the story to render
    await page.locator("#storybook-root > *").first().waitFor();

    // If story has a play function, wait for it to complete
    if (story.tags?.includes("play-fn")) {
      // Play functions set a data attribute when done
      await page.waitForTimeout(500);
    }

    // Take screenshot and compare
    await expect(page).toHaveScreenshot(`${story.id}.png`);
  });
}
