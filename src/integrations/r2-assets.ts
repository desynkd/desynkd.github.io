// Mirrors binary assets out of the private R2 bucket into `public/` before the
// build reads it.
//
// The bucket has no public access, so browsers cannot fetch `<img>` sources from
// it directly — every request would need signing. Instead the build downloads
// `<prefix>/images/**` to `public/images/**` and `<prefix>/resume.pdf` to
// `public/resume.pdf`, and markdown refers to them by site-absolute path:
//
//     ![A diagram](/images/pipeline.png "Optional caption")
//
// Both destinations are gitignored — R2 is the source of truth, the repo just
// caches a copy at build time.
import type { AstroIntegration } from "astro";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getObjectBytes, listObjects, objectExists, objectKey } from "../lib/r2";

const IMAGES_DIR = "images";
const RESUME_KEY = "resume.pdf";

async function syncImages(publicDir: string, log: (message: string) => void) {
  const keys = await listObjects(IMAGES_DIR);
  const destRoot = join(publicDir, IMAGES_DIR);

  // Wipe first so an image deleted in R2 stops being served on the next build.
  await rm(destRoot, { recursive: true, force: true });

  if (keys.length === 0) {
    log(`No images under "${IMAGES_DIR}/" in R2.`);
    return;
  }

  const prefix = `${objectKey(IMAGES_DIR)}/`;
  await Promise.all(
    keys.map(async (key) => {
      const dest = join(destRoot, key.slice(prefix.length));
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, await getObjectBytes(key));
    })
  );

  log(`Synced ${keys.length} image${keys.length === 1 ? "" : "s"} to public/${IMAGES_DIR}/.`);
}

async function syncResume(publicDir: string, log: (message: string) => void) {
  const key = objectKey(RESUME_KEY);
  const dest = join(publicDir, RESUME_KEY);

  if (!(await objectExists(key))) {
    await rm(dest, { force: true });
    log(`No ${RESUME_KEY} in R2 — skipping.`);
    return;
  }

  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, await getObjectBytes(key));
  log(`Synced ${RESUME_KEY} to public/.`);
}

export default function r2Assets(): AstroIntegration {
  return {
    name: "r2-assets",
    hooks: {
      "astro:config:setup": async ({ config, logger }) => {
        const publicDir = fileURLToPath(config.publicDir);
        const log = (message: string) => logger.info(message);

        await syncImages(publicDir, log);
        await syncResume(publicDir, log);
      },
    },
  };
}
