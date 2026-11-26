"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdminLanguage } from "./admin-language";

/** Appearance of the workspace in this browser: follow the system, always light or always dark. */
export type CmsScheme = "auto" | "light" | "dark";
export const CMS_SCHEME_KEY = "ws-admin-scheme";
export const CMS_SCHEME_EVENT = "cms:scheme";

export function readCmsScheme(): CmsScheme {
  try {
    const value = window.localStorage.getItem(CMS_SCHEME_KEY);
    return value === "light" || value === "dark" ? value : "auto";
  } catch { return "auto"; }
}

export function writeCmsScheme(value: CmsScheme) {
  try { if (value === "auto") window.localStorage.removeItem(CMS_SCHEME_KEY); else window.localStorage.setItem(CMS_SCHEME_KEY, value); } catch { /* storage blocked: applies to this visit */ }
  window.dispatchEvent(new CustomEvent(CMS_SCHEME_EVENT, { detail: value }));
}

const options = [
  { value: "auto", label: "Automatisch", icon: Monitor },
  { value: "light", label: "Hell", icon: Sun },
  { value: "dark", label: "Dunkel", icon: Moon },
] as const;

/** Segmented control for Settings and “Mein Zugang”. Stored per browser, not in the website content. */
export function CmsSchemeSetting() {
  const { t } = useAdminLanguage();
  const [value, setValue] = useState<CmsScheme>("auto");
  useEffect(() => setValue(readCmsScheme()), []);
  return <div className="cms-form-section cms-scheme-setting">
    <h3>{t("Darstellung der Verwaltung")}</h3>
    <p>{t("Gilt nur in diesem Browser. „Automatisch“ folgt der Einstellung Ihres Geräts. Die Farbe der Verwaltung richtet sich nach der Hauptfarbe Ihrer Website.")}</p>
    <div className="cms-segmented" role="radiogroup" aria-label={t("Darstellung der Verwaltung")}>
      {options.map(option => <button key={option.value} type="button" role="radio" aria-checked={value === option.value}
        onClick={() => { setValue(option.value); writeCmsScheme(option.value); }}>
        <option.icon size={16} aria-hidden="true" />{t(option.label)}
      </button>)}
    </div>
  </div>;
}
