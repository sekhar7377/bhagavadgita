import { defineConfig } from "vite";
import { resolve } from "node:path";

// GitHub Pages serves the site from /bhagavadgita/; locally it is the root.
// Two pages: the Mahabharata home and the Kurukshetra (Gita) wall.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        kurukshetra: resolve(__dirname, "kurukshetra/index.html"),
      },
    },
  },
});
