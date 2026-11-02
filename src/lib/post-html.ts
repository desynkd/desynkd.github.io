// Turns a blog post's HTML fragment into what ArticleLayout renders inline.
//
// Posts are trusted (only the site author writes them), so nothing is
// sanitised and scripts run as written. The fragment is changed in two ways:
//
//   - every <style> is fenced into the post with `@scope (.post)`, so a post's
//     CSS can never restyle the nav, header or footer around it;
//   - every <pre><code class="language-*"> is highlighted with Shiki at build
//     time, with the same css-variables theme Astro uses for markdown.
//
// Reading time is measured here too, from the prose alone.
import type { Element, ElementContent, Root } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import postcss from "postcss";
import {
  bundledLanguages,
  createCssVariablesTheme,
  createHighlighter,
  isSpecialLang,
  type Highlighter,
} from "shiki";
import { SKIP, visit } from "unist-util-visit";

/** Class on the element ArticleLayout renders the post into. */
export const POST_ROOT = ".post";

const WORDS_PER_MINUTE = 200;

// At-rules that don't belong inside @scope. They are global by nature, so they
// are lifted out of the fence and kept at the top of the stylesheet.
const HOISTED_AT_RULES = new Set([
  "charset",
  "import",
  "namespace",
  "font-face",
  "keyframes",
  "property",
  "counter-style",
  "font-feature-values",
  "font-palette-values",
  "page",
]);

// Subtrees that don't count towards reading time.
const NON_PROSE = new Set(["script", "style", "template", "pre", "code", "svg", "canvas"]);

function classes(node: Element): string[] {
  const value = node.properties.className;
  return Array.isArray(value) ? value.map(String) : [];
}

export function scopeCss(css: string): string {
  const source = postcss.parse(css);
  const hoisted = postcss.root();
  const scoped = postcss.atRule({ name: "scope", params: `(${POST_ROOT})` });

  source.each((node) => {
    const global =
      node.type === "atrule" &&
      HOISTED_AT_RULES.has(node.name.toLowerCase().replace(/^-[a-z]+-/, ""));
    (global ? hoisted : scoped).append(node.clone());
  });

  const parts = [hoisted.toString()];
  if (scoped.nodes?.length) parts.push(scoped.toString());
  return parts.filter(Boolean).join("\n");
}

const cssVariablesTheme = createCssVariablesTheme({ variablePrefix: "--astro-code-" });
let highlighter: Promise<Highlighter> | undefined;

async function highlight(code: string, lang: string): Promise<Element> {
  const shiki = await (highlighter ??= createHighlighter({ themes: [cssVariablesTheme], langs: [] }));

  let resolved = lang;
  if (!isSpecialLang(lang) && !shiki.getLoadedLanguages().includes(lang)) {
    if (lang in bundledLanguages) {
      await shiki.loadLanguage(lang as keyof typeof bundledLanguages);
    } else {
      console.warn(`[post-html] Unknown code language "${lang}", falling back to plaintext.`);
      resolved = "plaintext";
    }
  }

  const tree = shiki.codeToHast(code, { lang: resolved, theme: cssVariablesTheme.name! });
  const pre = tree.children[0] as Element;
  pre.properties.dataLanguage = lang;
  return pre;
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

// Code inside indented HTML carries that indentation, plus the newline after
// the opening tag. Neither is part of the snippet.
function dedent(code: string): string {
  const lines = code.replace(/^\r?\n/, "").replace(/\s+$/, "").split("\n");
  const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^[ \t]*/)![0].length);
  const indent = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(indent)).join("\n");
}

async function highlightCodeBlocks(tree: Root) {
  const blocks: { parent: Root | Element; index: number; code: string; lang: string }[] = [];

  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "pre" || !parent || index === undefined) return;

    const children = node.children.filter((child) => child.type === "element");
    const code = children.length === 1 && children[0].tagName === "code" ? children[0] : undefined;
    const lang = code && classes(code).find((name) => name.startsWith("language-"))?.slice(9);
    if (code && lang) blocks.push({ parent, index, code: dedent(textOf(code)), lang });

    return SKIP;
  });

  for (const { parent, index, code, lang } of blocks) {
    parent.children[index] = await highlight(code, lang);
  }
}

function scopeStyles(tree: Root) {
  visit(tree, "element", (node) => {
    if (node.tagName !== "style") return;
    node.children = [{ type: "text", value: scopeCss(node.children.map(textOf).join("")) }];
    return SKIP;
  });
}

function readingTime(tree: Root): number {
  let words = 0;
  visit(tree, (node) => {
    if (node.type === "element" && (NON_PROSE.has(node.tagName) || classes(node).includes("stage"))) {
      return SKIP;
    }
    if (node.type === "text") words += node.value.split(/\s+/).filter(Boolean).length;
  });
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export async function renderPostHtml(fragment: string): Promise<{ html: string; readingTime: number }> {
  const tree = fromHtml(fragment, { fragment: true });

  const minutes = readingTime(tree);
  scopeStyles(tree);
  await highlightCodeBlocks(tree);

  return { html: toHtml(tree), readingTime: minutes };
}
