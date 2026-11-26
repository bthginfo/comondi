"use client";

import { useEffect, useState } from "react";
import type { ComondiDesign } from "@/lib/types";
import { comondiDesignNames } from "@/lib/comondi-motion";
import { styles } from "./styles";

const storageKey = "comondi-design-review";
const readDesign = (value: unknown): ComondiDesign | undefined => value === "kosmos" || value === "atlas" ? value : undefined;
export const designReview = process.env.NEXT_PUBLIC_DESIGN_REVIEW !== "false";

/**
 * The CMS decides the default design. While the site is in review, visitors can compare
 * both designs; the choice follows them across pages and can be shared with ?entwurf=atlas.
 */
export function useComondiDesign(configured: ComondiDesign | undefined, editable = false): [ComondiDesign, (next: ComondiDesign) => void] {
  const fallback = configured ?? "kosmos";
  const [design, setDesign] = useState<ComondiDesign>(fallback);
  useEffect(() => {
    if (editable || !designReview) { setDesign(fallback); return; }
    let stored: string | null = null;
    try { stored = localStorage.getItem(storageKey); } catch { /* The URL still works without storage. */ }
    const fromUrl = readDesign(new URLSearchParams(window.location.search).get("entwurf"));
    setDesign(fromUrl ?? readDesign(stored) ?? fallback);
    if (fromUrl) try { localStorage.setItem(storageKey, fromUrl); } catch { /* Optional. */ }
  }, [editable, fallback]);
  const change = (next: ComondiDesign) => {
    setDesign(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Optional. */ }
    const url = new URL(window.location.href); url.searchParams.set("entwurf", next);
    window.history.replaceState(window.history.state, "", url);
  };
  return [design, change];
}

export function DesignSwitch({ design, onChange }: { design: ComondiDesign; onChange: (next: ComondiDesign) => void }) {
  return <div className={styles.designSwitch} role="group" aria-label="Website-Entwurf wählen">
    <span>Entwurf</span>
    {(Object.keys(comondiDesignNames) as ComondiDesign[]).map(option => <button key={option} type="button" aria-pressed={design === option} onClick={() => onChange(option)}>{comondiDesignNames[option]}</button>)}
  </div>;
}
