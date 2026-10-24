import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative asset URLs keep the production build portable on GitHub Pages
  // and other static hosts where the app is served below a repository path.
  base: "./",
  plugins: [react()],
  build: {
    // The on-demand CodeMirror workspace is ~510 kB uncompressed (~171 kB
    // gzip). It is intentionally isolated from the 362 kB campaign shell.
    chunkSizeWarningLimit: 550,
  },
  test: {
    include: ["src/**/*.test.js"],
  },
});
