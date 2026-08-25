// Build-time R2 access over the S3 API.
//
// The bucket is private, so every request is signed with a scoped read-only R2
// API token. Credentials come from the environment and never reach the browser:
// this module is only ever imported by the content loader and the asset-sync
// integration, both of which run in Node during `astro build` / `astro dev`.
import { AwsClient } from "aws4fetch";

export interface R2Config {
  accountId: string;
  bucket: string;
  /** Base prefix inside the bucket that this site owns, e.g. "port". */
  prefix: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[r2] Missing ${name}. Set it in .env for local builds and as a GitHub ` +
        `Actions secret for CI. See .env.example.`
    );
  }
  return value;
}

let cached: { client: AwsClient; config: R2Config; endpoint: string } | null = null;

function r2() {
  if (cached) return cached;

  const config: R2Config = {
    accountId: required("R2_ACCOUNT_ID"),
    bucket: process.env.R2_BUCKET || "prjkt",
    prefix: (process.env.R2_PREFIX ?? "port").replace(/^\/+|\/+$/g, ""),
  };

  const client = new AwsClient({
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });

  cached = {
    client,
    config,
    // R2_ENDPOINT exists so the loader can be pointed at a local S3 mock in
    // tests; in normal use the account-scoped R2 endpoint is derived.
    endpoint: (
      process.env.R2_ENDPOINT || `https://${config.accountId}.r2.cloudflarestorage.com`
    ).replace(/\/+$/, ""),
  };
  return cached;
}

/** Full object key for a path relative to the site's base prefix. */
export function objectKey(relativePath: string): string {
  const { config } = r2();
  const clean = relativePath.replace(/^\/+/, "");
  return config.prefix ? `${config.prefix}/${clean}` : clean;
}

function urlFor(key: string): string {
  const { endpoint, config } = r2();
  // Each segment is encoded separately so slashes stay path separators.
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `${endpoint}/${config.bucket}/${encoded}`;
}

function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * List every object key under `relativePath`, following pagination.
 * Returns full object keys (prefix included), with directory markers dropped.
 */
export async function listObjects(relativePath: string): Promise<string[]> {
  const { client, endpoint, config } = r2();
  const prefix = objectKey(relativePath.endsWith("/") ? relativePath : `${relativePath}/`);

  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const url = new URL(`${endpoint}/${config.bucket}`);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("prefix", prefix);
    if (continuationToken) url.searchParams.set("continuation-token", continuationToken);

    const response = await client.fetch(url.toString());
    if (!response.ok) {
      throw new Error(
        `[r2] ListObjectsV2 failed for "${prefix}": ${response.status} ${response.statusText}\n` +
          (await response.text())
      );
    }

    const xml = await response.text();
    for (const match of xml.matchAll(/<Key>([\s\S]*?)<\/Key>/g)) {
      const key = unescapeXml(match[1]);
      if (!key.endsWith("/")) keys.push(key);
    }

    const truncated = /<IsTruncated>true<\/IsTruncated>/.test(xml);
    const next = xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/);
    continuationToken = truncated && next ? unescapeXml(next[1]) : undefined;
  } while (continuationToken);

  return keys.sort();
}

async function getObject(key: string): Promise<Response> {
  const { client } = r2();
  const response = await client.fetch(urlFor(key));
  if (!response.ok) {
    throw new Error(
      `[r2] GET failed for "${key}": ${response.status} ${response.statusText}`
    );
  }
  return response;
}

export async function getObjectText(key: string): Promise<string> {
  return (await getObject(key)).text();
}

export async function getObjectBytes(key: string): Promise<Buffer> {
  return Buffer.from(await (await getObject(key)).arrayBuffer());
}

/** True if the object exists. Used for optional files like the resume. */
export async function objectExists(key: string): Promise<boolean> {
  const { client } = r2();
  const response = await client.fetch(urlFor(key), { method: "HEAD" });
  return response.ok;
}
