// Astro content-layer loader that sources markdown from Cloudflare R2.
//
// Slug derivation: `<prefix>/blog/my-post.md` -> `my-post`. Keys are expected to
// be flat within their directory; two files that reduce to the same slug is a
// build error rather than a silent overwrite.
import type { Loader } from "astro/loaders";
import matter from "gray-matter";
import { getObjectText, listObjects } from "@/lib/r2";

export interface R2LoaderOptions {
  /** Directory inside the site's base prefix, e.g. "blog" or "projects". */
  dir: string;
}

function slugFromKey(key: string): string {
  const basename = key.split("/").pop() ?? key;
  return basename.replace(/\.mdx?$/i, "");
}

export function r2Loader({ dir }: R2LoaderOptions): Loader {
  return {
    name: `r2:${dir}`,
    load: async ({ store, parseData, renderMarkdown, generateDigest, logger }) => {
      // A network or auth failure throws here and fails the build, which leaves
      // the previous GitHub Pages deploy in place. An empty directory is a
      // legitimate state (nothing published yet), so it only warns.
      const keys = (await listObjects(dir)).filter((key) => /\.mdx?$/i.test(key));

      if (keys.length === 0) {
        logger.warn(`No markdown found under "${dir}/" in R2 — collection is empty.`);
        store.clear();
        return;
      }

      const entries = await Promise.all(
        keys.map(async (key) => ({ key, raw: await getObjectText(key) }))
      );

      store.clear();
      const seen = new Map<string, string>();

      for (const { key, raw } of entries) {
        const id = slugFromKey(key);

        const collision = seen.get(id);
        if (collision) {
          throw new Error(
            `[r2:${dir}] Slug "${id}" is claimed by both "${collision}" and "${key}". ` +
              `Object names must be unique within a directory.`
          );
        }
        seen.set(id, key);

        const { data: frontmatter, content: body } = matter(raw);
        const data = await parseData({ id, data: frontmatter, filePath: key });
        const rendered = await renderMarkdown(body);

        store.set({ id, data, body, digest: generateDigest(raw), rendered });
      }

      logger.info(`Loaded ${entries.length} entr${entries.length === 1 ? "y" : "ies"} from R2.`);
    },
  };
}
