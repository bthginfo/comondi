"use client";

import { useEffect } from "react";

/**
 * Public pages are prerendered with the site's base language, so no request header is needed.
 * Pages in another language correct the document language once they are shown.
 */
export function DocumentLanguage({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = previous; };
  }, [lang]);
  return null;
}
