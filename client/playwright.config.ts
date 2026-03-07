import { defineConfig, devices } from '@playwright/test';

const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 240000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: skipWebServer
    ? undefined
    : [
        {
          command:
            'node ../scripts/start-local-db.js && node ../scripts/seed-role-readiness.js && node -r dotenv/config ../nest/dist/main.js dotenv_config_path=../.env.local',
          url: 'http://127.0.0.1:3000/health',
          timeout: 120000,
          reuseExistingServer: true,
          cwd: '.',
        },
        {
          command: 'npm run preview -- --host 127.0.0.1 --port 4173',
          url: 'http://127.0.0.1:4173',
          timeout: 120000,
          reuseExistingServer: true,
          cwd: '.',
        },
      ],
});
