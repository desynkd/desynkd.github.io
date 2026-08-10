---
title: "TIL: Astro content collections type-check your frontmatter"
description: "A quick note on how Astro's content collections catch schema mistakes at build time instead of runtime."
date: 2026-05-14
tags: ["til", "astro"]
---

Placeholder TIL post — proves the inert single-column path (no images, so the article CSS does nothing special). Replace with a real ~300-word note.

Astro's content collections let you define a Zod schema per collection, and every markdown file in that collection gets validated against it at build time. Get a field wrong — wrong type, missing required key, malformed date — and the build fails immediately with a clear error, instead of shipping a page that silently renders `undefined`.

The nice part is it composes with TypeScript: once the schema is defined, `getCollection()` and `getEntry()` return fully typed objects, so autocomplete works in `.astro` files without any extra plumbing.

Small thing, but it's the difference between finding a typo in a date field during `astro build` versus finding it three weeks later when a page silently breaks in production.
