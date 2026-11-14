import { defineConfig } from "vite";

// GitHub Pages serves the site from /bhagavadgita/; locally it is the root.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
});
