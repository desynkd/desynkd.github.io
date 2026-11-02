# Portfolio

Astro site deployed to GitHub Pages (desynkd.github.io).

## Blog posts

Posts are HTML fragments in `src/content/blog/<slug>.html`. Before writing or
editing one, read `src/content/blog/README.md`. It sets the file shape, the
shared styles (`figure`, `.wide`, `.callout`, `.stage`, code blocks), the colour
tokens to use, the JS conventions and where media goes. Copy
`src/content/blog/style-reference.html` as a starting point.

Media is never committed. It lives in R2 under `port/media/<slug>/` and is
mirrored into `public/` at build time.
