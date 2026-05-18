import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./vrt",
  snapshotPathTemplate: "{testDir}/__snapshots__/{platform}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:6007",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Serve the pre-built Storybook static files
    command: "npx http-server storybook-static --port 6007 --silent",
    url: "http://localhost:6007",
    reuseExistingServer: !process.env.CI,
  },
  // Snapshot settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0,
    },
  },
});
