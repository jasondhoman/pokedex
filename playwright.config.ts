import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/shared/tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm preview --host 127.0.0.1",
    // eslint-disable-next-line node/no-process-env
    reuseExistingServer: !process.env.CI,
    url: "http://127.0.0.1:4173",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
