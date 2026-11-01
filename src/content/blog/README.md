# Writing a blog post

Every post is one HTML file in this folder. The file name is the URL:
`my-post.html` is published at `/blog/my-post/`. Only top-level `.html` files
are posts, so notes like this README can sit beside them.

The quickest start is to copy [`style-reference.html`](style-reference.html).
It's a draft that uses every part of the shared styles. Run `npm run dev` and
open `/blog/style-reference/` to see it. The page reloads whenever you save a post.

## File shape

YAML frontmatter, then an HTML **fragment**. Don't add `<html>`, `<head>`
or `<body>`, because the site supplies the page around the post.

```html
---
title: The post title
description: One or two sentences. Used in the blog list, RSS and link previews.
date: 2026-11-01
updated: 2026-11-08      # optional
tags: [obsidian, plugin] # optional
draft: true              # optional, drafts only appear in `npm run dev`
---
<p>First paragraph…</p>
```

The page header (title, date, tags, reading time) is rendered from the
frontmatter. Don't repeat the title as an `<h1>`; start sections at `<h2>`.

## The house style

Posts render inside the site's layout, which supplies the fonts, colours and
prose styles. Plain HTML already looks right:
`<p>`, `<h2>`, `<h3>`, `<ul>`, `<ol>`, `<blockquote>`, `<a>`, `<code>`, `<strong>`, `<em>`.

| Want | Write |
| --- | --- |
| Image or video beside the text (desktop rail; end of post on mobile) | `<figure><img src="…" alt="…"><figcaption>…</figcaption></figure>` |
| Image that spans the article and stays in place | `<figure class="wide">…</figure>` |
| An aside, tip or caveat | `<div class="callout"><p>…</p></div>` |
| Highlighted code | `<pre><code class="language-ts">…</code></pre>` |
| Anything interactive or custom-drawn | `<div class="stage" id="<slug>-thing">…</div>` |

- **Code blocks** are highlighted at build time with the site's monochrome
  theme. Indentation inherited from the surrounding HTML and the newline after
  `<code>` are stripped. Inside them, escape `<` as `&lt;` and `&` as `&amp;`.
  Any [Shiki language](https://shiki.style/languages) works; unknown ones fall
  back to plain text.
- **Stages** are full-width frames: the shared styles set only the frame (rounded
  corners, raised background, sans font). Everything inside belongs to the post.
  The prose styles stop at a `.stage` boundary, so your markup inside it starts clean.

## Your own CSS and JS

Posts can do anything a Claude artifact can: `<style>`, `<script>`, canvas,
WebGL, SVG, ES modules.

**CSS.** Put `<style>` blocks anywhere in the post. The build fences each one
into the post with `@scope (.post)`, so even bare selectors like `a { … }`
can't touch the nav or footer. `@keyframes`, `@font-face`, `@property` and
`@import` are lifted out of the fence automatically. Your CSS always overrides
the shared styles, because those sit in a lower cascade layer, so there's
no specificity fight.

Outside a `.stage`, stay on the site palette. Use the tokens rather than raw colours:

| Token | Use |
| --- | --- |
| `--color-paper`, `--color-paper-raised` | backgrounds |
| `--color-silver`, `--color-rule` | fills, borders, dividers |
| `--color-ink`, `--color-ink-soft`, `--color-ink-mute` | text, strongest to faintest |
| `--font-sans`, `--font-serif` | Onest (UI, headings), Arvo (prose) |
| `--radius-card`, `--measure`, `--text-ui`, `--text-caption` | shape and type scale |

Inside a `.stage`, anything goes, though the tokens are still the easiest way
to look at home. Tailwind utilities (`text-ink-mute`, `grid`, `gap-4`, …) also
work, because Tailwind scans this folder.

**JS.** Scripts run exactly as written, once, when the page loads.

- Give your root element a slug-prefixed id and query **from it**:
  `document.getElementById("my-post-chart").querySelector("canvas")`.
  Never grab elements globally (`document.querySelector("canvas")`), because the
  page has its own canvases.
- Use `<script type="module">` and import libraries from a CDN **at an exact
  version**, never a range or `latest`:
  `import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.183.2/+esm";`
- Read colours from the tokens at runtime so canvases match the page:
  `getComputedStyle(document.documentElement).getPropertyValue("--color-ink")`.
- No `localStorage` keys without the slug as a prefix.

## Media

Media never goes in git. Upload it to R2 (bucket `prjkt`) and the build mirrors
it into `public/`:

| Upload to | Reference as | For |
| --- | --- | --- |
| `port/media/<slug>/clip.mp4` | `/media/<slug>/clip.mp4` | anything that belongs to one post (images, video, downloads, data files) |
| `port/images/name.png` | `/images/name.png` | images shared by several posts or pages |

Media is copied at the start of `npm run dev` / `npm run build`, so restart dev
after uploading. Because it's served from the same origin, canvas and WebGL
code can read the pixels without any CORS setup.
