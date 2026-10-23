import { defineConfig, devices } from "@playwright/test";

// The test process reads the same .env.local as the app (Supabase URL and key,
// E2E_* test accounts). Missing file: the signed-in tests skip themselves.
try {
  process.loadEnvFile(".env.local");
} catch {}

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * End-to-end acceptance checks against a production build.
 * Run `npm run build` first; the web server below only starts it.
 * Signed-in tests (tests/e2e/signed-in.spec.ts) run when E2E_MEMBER_* and
 * E2E_REVIEWER_* accounts are set in .env.local.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
