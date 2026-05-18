import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./vrt",
  snapshotPathTemplate: "{testDir}/__snapshots__/{platform}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:6008",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx http-server storybook-static --port 6008 --silent",
    url: "http://localhost:6008",
    reuseExistingServer: !process.env.CI,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0,
    },
  },
});
