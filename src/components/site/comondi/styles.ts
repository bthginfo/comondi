import base from "./comondi.module.css";
import atlas from "./comondi-atlas.module.css";
import pages from "./comondi-pages.module.css";
import pagesAtlas from "./comondi-pages-atlas.module.css";

/**
 * Both co:mondi designs share the same markup. Every element carries the class of the
 * Kosmos stylesheet and, where it exists, the matching Atlas class; the Atlas rules only
 * apply below a site root with data-cm-design="atlas". The subpage sections add their own
 * pair of stylesheets with the same rule.
 */
const modules = [base, atlas, pages, pagesAtlas];
export const styles: Record<string, string> = Object.fromEntries(
  [...new Set(modules.flatMap(module => Object.keys(module)))].map(name => [name, modules.map(module => module[name]).filter(Boolean).join(" ")]),
);
