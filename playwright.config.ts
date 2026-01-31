import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: process.env.APP_BASE_URL || "https://ghostcrm.ai", headless: true },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start", // Next.js
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
});
