# Adding a project

Every project is one HTML file in this folder, written just like a blog post.
The file name is the URL: `my-app.html` is published at `/my-app/`, and a
`featured` project also gets a card under "Selected work" on the landing page
(four at most, sorted by `order`).

The body uses the same house style, CSS/JS conventions and media rules as blog
posts, so read [`../blog/README.md`](../blog/README.md) first. Only the
frontmatter is different:

```html
---
title: My App
outcome: The one-liner that leads. Shown on the card, under the title and in link previews.
role: Solo · design, build, release
timeframe: 2026
status: in-progress          # shipped | in-progress | archived
stack: [Expo, React Native]  # chips on the card and page
live: https://example.com    # optional, "Live ↗"
repo: https://github.com/…   # optional, "Repo ↗"
image: /media/my-app/og.png  # optional, 1200×630 link preview
featured: true               # optional, show on the landing page
order: 1                     # optional, lower comes first
draft: true                  # optional, drafts only appear in `npm run dev`
---
<p>First paragraph…</p>
```

The header (title, outcome, role, timeframe, status, links) and the stack chips
come from the frontmatter. Start sections at `<h2>`.

Media goes in R2 under `port/media/<slug>/` and is referenced as
`/media/<slug>/…`. Projects and posts share that folder, so don't give a project
the same slug as a post.

Slugs can't be `blog`, `rss`, `404`, `about`, `_astro`, `fonts`, `media` or
`images`, because those are top-level routes. The build fails if one is used.
