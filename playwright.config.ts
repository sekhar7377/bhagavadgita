import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
const chromium =
  process.env.CHROMIUM_PATH ||
  ['/usr/bin/chromium', '/opt/pw-browsers/chromium'].find((path) => existsSync(path));
export default defineConfig({
  testDir: './tests',
  // The opening is GPU work; CI and cloud browsers render it in software.
  timeout: 120000,
  expect: { timeout: 20000 }, fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', launchOptions: { executablePath: chromium, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] } },
  webServer: { command: 'npm run dev -- --port 5173', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
});
