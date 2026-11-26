"use client";

import { useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronLeft, Cookie, X } from "lucide-react";
import type { NavItem, SiteConfig, SiteLanguage } from "@/lib/types";
import { nativeVideoSource } from "@/lib/external-media";
import { isolatedMediaUrl } from "@/lib/isolated-media";
import { startFirstPartyAnalytics, clearFirstPartyAnalytics } from "@/lib/analytics/client";
import type { AnalyticsPublic } from "@/lib/analytics/model";
import { readConsent, storeConsent, storageKey, consentChangedEvent, type Consent } from "@/lib/analytics/consent-state";
import { consentBanner, type ConsentScriptCategory, type PublicConsentScripts } from "@/lib/consent/model";
import { mountConsentScripts } from "@/lib/consent/runtime";
import { safeHref, SiteInteractionContext } from "./editable";

export const consentEvent = "hp:consent-settings";
export { readConsent, consentChangedEvent };

export type PublishedConsent = {
  tracking: boolean;
  legalLinks: readonly NavItem[];
  scripts?: PublicConsentScripts;
  /** Public statistics settings rendered with the page, so a visit needs no settings request. Measurement still waits for consent. */
  analytics?: AnalyticsPublic;
};

type OptionalChoice = Record<ConsentScriptCategory, boolean>;
const essentials: OptionalChoice = { analytics: false, external: false, marketing: false };

export function ConsentManager({ site, language = "de", published }: { site: SiteConfig; language?: SiteLanguage; published?: PublishedConsent }) {
  const t = (de: string, en: string) => language === "en" ? en : de;
  const { isolated } = useContext(SiteInteractionContext);
  const tracking = published?.tracking === true && !isolated;
  const scripts = tracking ? published?.scripts : undefined;
  const [fetchedConfig, setNativeConfig] = useState<AnalyticsPublic | null>(null);
  // Keep one object per settings value, so client-side page changes do not restart a running measurement.
  const renderedKey = tracking && published?.analytics ? JSON.stringify(published.analytics) : "";
  const renderedConfig = useMemo(() => renderedKey ? JSON.parse(renderedKey) as AnalyticsPublic : null, [renderedKey]);
  const nativeConfig = renderedConfig ?? fetchedConfig;
  const configRequest = useRef<Promise<AnalyticsPublic | null> | null>(null);
  const decision = useRef(0);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<Consent | null>(null);
  const [options, setOptions] = useState<OptionalChoice | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!tracking || renderedKey) return;
    const abort = new AbortController();
    const request: Promise<AnalyticsPublic | null> = fetch("/api/analytics/config", { signal: abort.signal, cache: "no-store" })
      .then(response => response.ok ? response.json() : null)
      .catch(() => null);
    configRequest.current = request;
    void request.then(config => { if (config && !abort.signal.aborted) setNativeConfig(config); });
    return () => { decision.current++; configRequest.current = null; abort.abort(); };
  }, [tracking, renderedKey]);

  useEffect(() => {
    if (!tracking || !nativeConfig) return;
    let stop = () => {};
    let active: boolean | undefined;
    const update = () => {
      const consent = readConsent();
      const allowed = nativeConfig.enabled && consent?.analytics === true && consent.statisticsGeneration === nativeConfig.generation;
      if (active === allowed) return;
      stop();
      active = allowed;
      if (allowed) stop = startFirstPartyAnalytics(nativeConfig);
      else clearFirstPartyAnalytics();
    };
    const storage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) update(); };
    update();
    window.addEventListener(consentChangedEvent, update);
    window.addEventListener("storage", storage);
    return () => {
      stop();
      window.removeEventListener(consentChangedEvent, update);
      window.removeEventListener("storage", storage);
    };
  }, [nativeConfig, tracking]);

  useEffect(() => {
    if (isolated) return;
    const update = () => setChoice(readConsent());
    const storage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) update(); };
    update();
    setReady(true);
    window.addEventListener(consentChangedEvent, update);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(consentChangedEvent, update);
      window.removeEventListener("storage", storage);
    };
  }, [isolated]);

  useEffect(() => {
    if (scripts) return mountConsentScripts(scripts, language);
  }, [scripts, language]);

  const statisticsGeneration = tracking ? nativeConfig?.generation : undefined;
  const statisticsEnabled = tracking && nativeConfig?.enabled === true;
  const scriptGeneration = scripts?.generation;
  const unversionedDenial = choice?.analytics === false && choice.statisticsGeneration === undefined;
  const requireStatisticsChoice = statisticsEnabled && !unversionedDenial && choice?.statisticsGeneration !== statisticsGeneration;
  useEffect(() => {
    if (!unversionedDenial || statisticsGeneration === undefined) return;
    const stored = readConsent();
    if (stored?.analytics !== false || stored.statisticsGeneration !== undefined || stored.savedAt !== choice?.savedAt) return;
    // A refusal made while loading applies immediately. Record the first known
    // version so a future, genuinely changed purpose still follows the usual flow.
    const denial = { ...stored, statisticsGeneration };
    storeConsent(denial);
    setChoice(denial);
  }, [choice?.savedAt, statisticsGeneration, unversionedDenial]);
  const requireScriptChoice = Boolean(scripts && choice?.scriptsGeneration !== scriptGeneration);
  const visible = options !== null || ready && ((!choice && site.consent.enabled) || requireStatisticsChoice || requireScriptChoice);
  const custom = options !== null;

  useEffect(() => {
    if (isolated) return;
    const open = () => {
      decision.current++;
      setSaving(false);
      previousFocus.current = document.activeElement as HTMLElement | null;
      const saved = readConsent();
      setOptions({
        analytics: saved?.analytics === true && (!statisticsEnabled || saved.statisticsGeneration === statisticsGeneration),
        external: saved?.external === true,
        marketing: saved?.marketing === true && saved.scriptsGeneration === scriptGeneration,
      });
    };
    window.addEventListener(consentEvent, open);
    return () => window.removeEventListener(consentEvent, open);
  }, [isolated, statisticsEnabled, statisticsGeneration, scriptGeneration]);

  useEffect(() => {
    if (custom) dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [custom]);

  function openSettings() {
    window.dispatchEvent(new Event(consentEvent));
  }

  function restoreFocus() {
    requestAnimationFrame(() => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else settingsButton.current?.focus();
    });
  }

  function closeSettings() {
    decision.current++;
    setSaving(false);
    setOptions(null);
    restoreFocus();
  }

  async function save(selected: OptionalChoice) {
    if (saving && selected.analytics) return;
    const current = ++decision.current;
    let generation = statisticsGeneration;
    if (selected.analytics && tracking && generation === undefined && configRequest.current) {
      const previous = readConsent();
      setSaving(true);
      generation = (await configRequest.current)?.generation;
      if (current !== decision.current) return;
      const latest = readConsent();
      if (latest?.savedAt !== previous?.savedAt) {
        setChoice(latest);
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    const consent: Consent = {
      version: 1,
      necessary: true,
      analytics: selected.analytics,
      external: selected.external,
      marketing: selected.marketing,
      statisticsGeneration: generation,
      scriptsGeneration: scriptGeneration,
      savedAt: new Date().toISOString(),
    };
    storeConsent(consent);
    setChoice(consent);
    setOptions(null);
    window.dispatchEvent(new CustomEvent(consentChangedEvent, { detail: consent }));
    restoreFocus();
  }

  if (isolated) return null;
  const hasMarketing = scripts?.items.some(item => item.category === "marketing") ?? false;
  const copy = consentBanner(site, language);
  const footer = language === "en" ? site.locales?.en?.footer ?? site.footer : site.footer;
  const entry = (tracking && nativeConfig?.everEnabled) || site.consent.enabled && (site.modules?.creator?.enabled || footer?.showCookieSettings === false);
  const category = (id: ConsentScriptCategory, label: string, description: string) => {
    const names = scripts?.items.filter(item => item.category === id).map(item => item.name) ?? [];
    return <label>
      <span><strong>{label}</strong><small>{description}</small>
        {names.length > 0 && <small>{t("Dienste", "Services")}: {names.join(", ")}</small>}
      </span>
      <input type="checkbox" checked={options?.[id] ?? false} onChange={event => {
        decision.current++;
        setSaving(false);
        const checked = event.currentTarget.checked;
        setOptions(current => current ? { ...current, [id]: checked } : current);
      }} />
    </label>;
  };

  return <>
    {entry && <div className="ws-native-consent-entry"><button type="button" onClick={openSettings}>{t("Datenschutzeinstellungen", "Privacy settings")}</button></div>}
    {tracking && <Analytics site={site} />}
    {visible && <div className={custom ? "ws-consent-backdrop" : "ws-consent-wrap"}>
      <div className={custom ? "ws-consent ws-consent-custom" : "ws-consent"} ref={dialogRef}
        role={custom ? "dialog" : "region"} aria-modal={custom || undefined} aria-labelledby={titleId}
        onKeyDown={event => {
          if (!custom) return;
          if (event.key === "Escape") { event.preventDefault(); closeSettings(); return; }
          if (event.key !== "Tab") return;
          const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href], input:not([disabled])") ?? []);
          const first = items[0], last = items.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}>
        <div className="ws-consent-heading">
          <Cookie size={23} aria-hidden="true" />
          <h2 id={titleId}>{custom ? t("Ihre Datenschutzeinstellungen", "Privacy settings") : copy.title}</h2>
          {custom && <button type="button" className="ws-icon-button" aria-label={t("Zurück zur Auswahl", "Back to choices")} onClick={closeSettings}><X size={20} /></button>}
        </div>
        <p>{copy.text}</p>
        {requireScriptChoice && choice && <p>{t("Die optionalen Dienste wurden geändert. Bitte prüfen Sie Ihre Auswahl.", "The optional services have changed. Review your choices.")}</p>}
        {custom && <div className="ws-consent-categories">
          <label>
            <span><strong>{t("Notwendig", "Essential")}</strong><small>{t("Technisch erforderliche Funktionen und die Speicherung Ihrer Auswahl.", "Essential functions and storage of your preferences.")}</small></span>
            <input type="checkbox" checked disabled aria-label={t("Notwendige Cookies, immer aktiv", "Essential cookies, always active")} />
            <Check className="ws-necessary-check" size={18} />
          </label>
          {category("analytics", t("Statistik", "Analytics"), statisticsEnabled
            ? t("Erfasst Seitenaufrufe, aktive Lesezeit, Herkunft und grobe Geräteangaben mit zufälligen Kennungen.", "Records page views, active reading time, referrals and broad device information using random identifiers.")
            : t("Hilft uns, die Nutzung unserer Website zu verstehen.", "Helps us understand how our website is used."))}
          {category("external", t("Externe Medien", "External media"), t("Erlaubt Videos, Karten und weitere eingebundene Dienste.", "Allows embedded videos, maps and other external services."))}
          {hasMarketing && category("marketing", t("Marketing", "Marketing"), t("Erlaubt optionale Dienste zur Kampagnenmessung und Personalisierung.", "Allows optional services for campaign measurement and personalisation."))}
        </div>}
        {saving && <p role="status">{t("Auswahl wird gespeichert …", "Saving your choices …")}</p>}
        <div className="ws-consent-actions">
          <button type="button" className="ws-button ws-button-outline" onClick={() => void save(essentials)}>{t("Nur notwendige", "Essential only")}</button>
          <button type="button" className="ws-button ws-button-outline" aria-disabled={saving || undefined} onClick={() => void save({ analytics: true, external: true, marketing: hasMarketing })}>{t("Alle akzeptieren", "Accept all")}</button>
          {options ? <button type="button" className="ws-text-button" aria-disabled={saving || undefined} onClick={() => void save(options)}>{t("Auswahl speichern", "Save choices")} <Check size={16} /></button>
            : <button type="button" ref={settingsButton} className="ws-text-button" onClick={openSettings}>{t("Einstellungen", "Settings")} <ArrowUpRight size={16} /></button>}
        </div>
        <div className="ws-consent-links">
          {published?.legalLinks.map(link => <a key={link.href} href={safeHref(link.href)}>{link.label}</a>)}
          {custom && <button type="button" onClick={closeSettings}><ChevronLeft size={13} /> {t("Zurück", "Back")}</button>}
        </div>
      </div>
    </div>}
  </>;
}

type TrackingWindow = Window & typeof globalThis & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; _paq?: unknown[][] };
function Analytics({ site }: { site: SiteConfig }) {
  const loaded = useRef(false);
  useEffect(() => {
    const win = window as TrackingWindow;
    const googleId = site.analytics.googleId;
    const deactivate = () => {
      if (googleId) (win as unknown as Record<string, unknown>)[`ga-disable-${googleId}`] = true;
      win.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      win._paq?.push(["forgetConsentGiven"]);
      document.querySelectorAll("script[data-hp-analytics]").forEach(script => script.remove());
      loaded.current = false;
    };
    const activate = () => {
      if (!readConsent()?.analytics) { deactivate(); return; }
      if (googleId) (win as unknown as Record<string, unknown>)[`ga-disable-${googleId}`] = false;
      if (loaded.current) { win.gtag?.("consent", "update", { analytics_storage: "granted" }); win._paq?.push(["setConsentGiven"]); return; }
      loaded.current = true;
      if (/^G-[A-Z0-9]+$/.test(googleId)) {
        win.dataLayer = win.dataLayer ?? [];
        win.gtag = function (...args: unknown[]) { win.dataLayer!.push(args); };
        win.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        win.gtag("js", new Date()); win.gtag("config", googleId, { anonymize_ip: true });
        const script = document.createElement("script"); script.async = true; script.dataset.hpAnalytics = "google";
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`; document.head.appendChild(script);
      }
      if (site.analytics.matomoUrl && /^\d+$/.test(site.analytics.matomoSiteId)) {
        try {
          const url = new URL(site.analytics.matomoUrl);
          if (url.protocol !== "https:") return;
          const base = url.href.replace(/\/$/, "");
          win._paq = win._paq ?? [];
          win._paq.push(["requireConsent"], ["setConsentGiven"], ["setTrackerUrl", `${base}/matomo.php`], ["setSiteId", site.analytics.matomoSiteId], ["trackPageView"], ["enableLinkTracking"]);
          const script = document.createElement("script"); script.async = true; script.dataset.hpAnalytics = "matomo"; script.src = `${base}/matomo.js`; document.head.appendChild(script);
        } catch { /* Invalid settings never load a remote script. */ }
      }
    };
    const storage=(event:StorageEvent)=>{if(event.key===storageKey||event.key===null)activate();};
    activate(); window.addEventListener(consentChangedEvent, activate);window.addEventListener('storage',storage);
    return () => {window.removeEventListener(consentChangedEvent, activate);window.removeEventListener('storage',storage);};
  }, [site.analytics]);
  return null;
}

export function ExternalMedia({ kind, url, address, title, editable }: { kind: "video" | "map"; url?: string; address?: string; title: string; editable?: boolean }) {
  const {isolated}=useContext(SiteInteractionContext);
  const [allowed, setAllowed] = useState(false);
  const [once, setOnce] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string | null>(null);
  const permissionKey = `${kind}:${url ?? address ?? ''}`;
  const frameRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => { setOrigin(window.location.origin); }, []);
  useEffect(() => { if (once === permissionKey && !editable) frameRef.current?.focus({ preventScroll: true }); }, [once, permissionKey, editable]);
  useEffect(() => {
    const update = (event?: Event) => {
      const external = Boolean((event instanceof CustomEvent ? event.detail as Consent : readConsent())?.external);
      setAllowed(external);
      if (event && !external) setOnce(null);
    };
    update(); window.addEventListener(consentChangedEvent, update);
    return () => window.removeEventListener(consentChangedEvent, update);
  }, []);
  const nativeVideo = kind === 'video' ? nativeVideoSource(url, origin) : null;
  const permitted = allowed || once === permissionKey;
  let embedUrl = "";
  if (url) {
    try {
      const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://example.invalid");
      if (kind === "video") {
        const youtube = /^(?:www\.)?youtube(?:-nocookie)?\.com$/.test(parsed.hostname) ? parsed.searchParams.get("v") ?? parsed.pathname.split("/embed/")[1] : parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : "";
        if (youtube && /^[a-zA-Z0-9_-]{6,20}$/.test(youtube)) embedUrl = `https://www.youtube-nocookie.com/embed/${youtube}`;
        else if (/^(?:www\.|player\.)?vimeo\.com$/.test(parsed.hostname)) { const videoId = parsed.pathname.match(/\d+/)?.[0]; if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`; }
      } else if (parsed.protocol === "https:" && /^(?:(?:www|maps)\.google\.(?:com|de)|www\.openstreetmap\.org)$/.test(parsed.hostname) && /\/embed/.test(parsed.pathname)) embedUrl = parsed.href;
    } catch { /* An invalid URL remains a local information panel. */ }
  }
  if (kind === "map" && !url && address?.trim()) embedUrl = `https://maps.google.com/maps?output=embed&hl=de&z=16&q=${encodeURIComponent(address.trim())}`;
  const googleMap = kind === "map" && /^https:\/\/(?:maps|www)\.google\./.test(embedUrl);
  if(isolated&&(!isolatedMediaUrl(url,'video')||kind==="map"))return <div className="ws-external-placeholder"><strong>{title}</strong><p>Lokaler Platzhalter. In dieser Demo werden keine externen Dienste geladen.</p></div>;
  if (nativeVideo && (!nativeVideo.external || permitted && !editable)) return <video key={nativeVideo.url} className="ws-native-video" src={nativeVideo.url} controls preload="metadata" aria-label={title} />;
  if (embedUrl && permitted && !editable) return <iframe ref={frameRef} className={`ws-embed ws-embed-${kind}`} src={embedUrl} title={kind === "map" ? `${googleMap ? "Google Maps" : "Karte"}: ${address || title}` : title} loading="lazy" allow={kind === "video" ? "fullscreen; picture-in-picture" : undefined} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
  return <div className={`ws-external-placeholder ws-external-${kind}`}>
    <div className="ws-external-orbit" aria-hidden="true"><span /><span /><span /></div>
    <h3>{kind === "map" ? googleMap ? "Unser Unternehmen auf Google Maps." : "Unser Unternehmen auf der Karte." : title}</h3>
    <p>{embedUrl || nativeVideo ? kind === "map" ? `Wenn Sie die Karte laden, werden Ihre IP-Adresse und weitere Nutzungsdaten an ${googleMap ? "Google" : "den Kartenanbieter"} übertragen. Die Freigabe gilt für diese Ansicht. Sie können sie auch über die Cookie-Einstellungen widerrufen.` : "Beim Laden des Videos werden Daten an den jeweiligen Anbieter übertragen. Weitere Informationen finden Sie in unseren Datenschutzhinweisen." : kind === "map" ? "Planen Sie Ihre Anfahrt mit dem Routenplaner Ihrer Wahl." : "Hier ist derzeit kein Video hinterlegt."}</p>
    {(embedUrl || nativeVideo) && <button type="button" className="ws-button ws-button-dark" disabled={editable} onClick={() => setOnce(permissionKey)}>{kind === "map" ? googleMap ? "Google Maps einmalig laden" : "Karte einmalig laden" : "Video einmalig laden"} <ArrowUpRight size={18} /></button>}
    <a href="/datenschutz" className="ws-inline-link">Datenschutzhinweise</a>
  </div>;
}
