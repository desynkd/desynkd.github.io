// Mirrors binary assets out of the private R2 bucket into `public/` before the
// build reads it.
//
// The bucket has no public access, so browsers cannot fetch `<img>` sources or
// download links from it directly — every request would need signing. Instead
// the build downloads `<prefix>/images/**` to `public/images/**`,
// `<prefix>/files/**` to `public/files/**` and `<prefix>/resume.pdf` to
// `public/resume.pdf`, and markdown refers to them by site-absolute path:
//
//     ![A diagram](/images/pipeline.png "Optional caption")
//     [Sample vault](/files/chicago-sample-vault.zip)
//
// All three destinations are gitignored — R2 is the source of truth, the repo
// just caches a copy at build time.
import type { AstroIntegration } from "astro";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getObjectBytes, listObjects, objectExists, objectKey } from "../lib/r2";

const IMAGES_DIR = "images";
const FILES_DIR = "files";
const RESUME_KEY = "resume.pdf";

/**
 * Mirror every object under `dir` in R2 to `public/<dir>`, preserving the
 * layout below the prefix. Missing or empty directories are not an error:
 * a site with no downloads simply has nothing to sync.
 */
async function syncDir(dir: string, publicDir: string, log: (message: string) => void) {
  const keys = await listObjects(dir);
  const destRoot = join(publicDir, dir);

  // Wipe first so an object deleted in R2 stops being served on the next build.
  await rm(destRoot, { recursive: true, force: true });

  if (keys.length === 0) {
    log(`No objects under "${dir}/" in R2.`);
    return;
  }

  const prefix = `${objectKey(dir)}/`;
  await Promise.all(
    keys.map(async (key) => {
      const dest = join(destRoot, key.slice(prefix.length));
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, await getObjectBytes(key));
    })
  );

  log(`Synced ${keys.length} object${keys.length === 1 ? "" : "s"} to public/${dir}/.`);
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

        await syncDir(IMAGES_DIR, publicDir, log);
        await syncDir(FILES_DIR, publicDir, log);
        await syncResume(publicDir, log);
      },
    },
  };
}
