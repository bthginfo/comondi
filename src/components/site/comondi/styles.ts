import base from "./comondi.module.css";
import atlas from "./comondi-atlas.module.css";

/**
 * Both co:mondi designs share the same markup. Every element carries the class of the
 * Kosmos stylesheet and, where it exists, the matching Atlas class; the Atlas rules only
 * apply below a site root with data-cm-design="atlas".
 */
export const styles: Record<string, string> = Object.fromEntries(
  [...new Set([...Object.keys(base), ...Object.keys(atlas)])].map(name => [name, [base[name], atlas[name]].filter(Boolean).join(" ")]),
);
