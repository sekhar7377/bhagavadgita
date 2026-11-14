import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
const chromium =
  process.env.CHROMIUM_PATH ||
  ["/usr/bin/chromium", "/opt/pw-browsers/chromium"].find((path) =>
    existsSync(path),
  );
// The wall is GPU work. On the user's Windows PC, run the browser on the
// discrete GPU (GTX 1650 via ANGLE/D3D11), which makes the suite several
// times faster than software rendering. CI, cloud runners and anyone who
// sets PW_SOFTWARE=1 keep SwiftShader.
const useGpu =
  process.platform === "win32" && !process.env.CI && !process.env.PW_SOFTWARE;
const gpuArgs = [
  "--use-angle=d3d11",
  "--ignore-gpu-blocklist",
  "--force_high_performance_gpu",
  "--enable-gpu-rasterization",
];
export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  expect: { timeout: 20000 },
  fullyParallel: useGpu,
  workers: useGpu ? 3 : 1,
  use: {
    baseURL: "http://127.0.0.1:5173",
    launchOptions: {
      executablePath: chromium,
      args: [
        "--no-sandbox",
        ...(useGpu ? gpuArgs : ["--enable-unsafe-swiftshader"]),
      ],
    },
  },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
});
