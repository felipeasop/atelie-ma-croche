import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { ProdutoMetaSchema } from "./catalogo/schema.ts";

const produtos = defineCollection({
  loader: glob({
    base: "./src/content/produtos",
    pattern: "**/*.json",
    generateId: ({ entry }) => entry.replace(/\.json$/, ""),
  }),
  schema: ProdutoMetaSchema,
});

export const collections = { produtos };
