// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://felipeasop.github.io",
  base: "/atelie-ma-croche",
  integrations: [sitemap()],
  output: "static",
});
