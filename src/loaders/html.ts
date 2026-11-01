// Astro content-layer loader for blog posts written as HTML.
//
// Each `<base>/<slug>.html` is YAML frontmatter followed by an HTML fragment,
// which ArticleLayout renders inline (see `renderPostHtml` for what happens to
// it on the way). Only top-level `.html` files are posts, so a README or other
// notes can sit alongside them.
import type { Loader } from "astro/loaders";
import matter from "gray-matter";
import { readdir, readFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPostHtml } from "@/lib/post-html";

export interface HtmlLoaderOptions {
  /** Directory holding the posts, relative to the project root. */
  base: string;
}

const isPost = (file: string) => /\.html$/i.test(file);

export function htmlLoader({ base }: HtmlLoaderOptions): Loader {
  return {
    name: `html:${base}`,
    load: async ({ config, store, parseData, generateDigest, logger, watcher }) => {
      const root = fileURLToPath(config.root);
      const dir = resolve(root, base);

      async function sync() {
        const files = (await readdir(dir)).filter(isPost).sort();
        const entries = await Promise.all(
          files.map(async (file) => ({ file, raw: await readFile(join(dir, file), "utf8") }))
        );

        store.clear();
        for (const { file, raw } of entries) {
          const id = file.replace(/\.html$/i, "");
          const { data: frontmatter, content: body } = matter(raw);
          const data = await parseData({ id, data: frontmatter, filePath: join(base, file) });
          const { html, readingTime } = await renderPostHtml(body);

          store.set({
            id,
            data,
            body,
            digest: generateDigest(raw),
            rendered: { html, metadata: { readingTime } },
          });
        }

        logger.info(`Loaded ${entries.length} post${entries.length === 1 ? "" : "s"} from ${base}/.`);
      }

      await sync();

      // Dev only: re-sync when a post is added, edited or removed so the page
      // reloads while writing. A broken post logs instead of killing the server.
      watcher?.add(dir);
      watcher?.on("all", async (_event, path) => {
        const rel = relative(dir, path);
        if (!rel || rel.startsWith("..") || isAbsolute(rel) || /[\\/]/.test(rel) || !isPost(rel)) return;
        try {
          await sync();
        } catch (error) {
          logger.error(error instanceof Error ? error.message : String(error));
        }
      });
    },
  };
}
