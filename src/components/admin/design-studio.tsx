"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, Globe, ImageIcon, Menu, Monitor, Pencil, Pipette, Redo2, RotateCcw, Save, Smartphone, SwatchBook, Tablet, Type, Undo2, Wand2, Sparkles, Shapes } from "lucide-react";
import type { ColorPalette, DesignVariant, MediaAsset, SiteConfig, WebsiteContent } from "@/lib/types";
import { defaultPalettes, paletteFor, variantNames } from "@/lib/theme";
import { brandCandidates, deriveCmsAccent, isHexColor, normalizeHex, usableBrandColor } from "@/lib/cms-accent";
import { checkPalette, dominantColors, fixPalette, paletteProposals, type PaletteStyle } from "@/lib/brand-palette";
import { BUTTON_SHAPES, DENSITIES, FONT_PAIRINGS, IMAGE_STYLES, RADIUS_PRESETS, TYPE_SCALES, currentPairing, radiusPreset } from "@/lib/site-style";
import { cmsTypeface } from "@/lib/cms-typefaces";
import { SiteView } from "@/components/site/site-view";
import { useAdminLanguage } from "./admin-language";
import { Button, Field, IconButton, Input, Notice, Select, Toggle } from "./admin-ui";
import { ColorField } from "./color-field";
import { DraftStatus } from "./editor-feedback";
import { MediaPicker, type MediaActions } from "./media-manager";
import { PreviewFrame, usePreviewDevice } from "./preview-frame";
import { useSheetGesture } from "./sheet-gesture";
import { ComondiDesignTiles, comondiOriginalColors, comondiOriginalPalette, isComondiSite } from "./comondi-design-options";

export type DesignStudioProps = {
  content: WebsiteContent; media: MediaAsset[]; onUpload: MediaActions["onUpload"]; onChange: (content: WebsiteContent) => void;
  dirty: boolean; busy: string | null; saveError: boolean; savedAt?: string; pending: boolean;
  onSave: () => Promise<void>; onPublish?: () => Promise<void>;
  undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean;
  onOpenMenu?: (trigger: HTMLButtonElement) => void; menuOpen?: boolean; onOpenEditor?: () => void;
};
type Panel = "colors" | "fonts" | "style" | "logo";
const panels: { id: Panel; label: string; icon: typeof SwatchBook }[] = [
  { id: "colors", label: "Farben", icon: SwatchBook }, { id: "fonts", label: "Schrift", icon: Type },
  { id: "style", label: "Stil", icon: Shapes }, { id: "logo", label: "Logo", icon: ImageIcon },
];

/** Renders the first colours of an image (same origin or CORS-enabled) into a small canvas. */
async function imageColors(url: string): Promise<string[]> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("load")); image.src = url; });
  const canvas = document.createElement("canvas"); canvas.width = 72; canvas.height = 72;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];
  context.drawImage(image, 0, 0, 72, 72);
  return dominantColors(context.getImageData(0, 0, 72, 72).data);
}

function Tile({ selected, onSelect, children, label, className = "" }: { selected: boolean; onSelect: () => void; children: ReactNode; label: string; className?: string }) {
  return <button type="button" role="radio" aria-checked={selected} className={`cms-design-tile ${className}`} onClick={onSelect}>
    <span className="cms-design-tile-art" aria-hidden="true">{children}</span>
    <span className="cms-design-tile-label">{label}{selected && <Check size={15} aria-hidden="true" />}</span>
  </button>;
}

export function DesignStudio({ content, media, onUpload, onChange, dirty, busy, saveError, savedAt, pending, onSave, onPublish, undo, redo, canUndo, canRedo, onOpenMenu, menuOpen = false, onOpenEditor }: DesignStudioProps) {
  const { t, language } = useAdminLanguage();
  const config = content.config; const theme = config.theme;
  const variant = (config.designVariant ?? 1) as DesignVariant;
  const creator = config.modules?.creator?.enabled === true;
  // co:mondi renders its own designs Kosmos and Atlas; the starter layouts do not apply there.
  const comondi = isComondiSite(config);
  const palette = paletteFor(config, variant);
  const [panel, setPanel] = useState<Panel>("colors");
  const [device, setDevice] = usePreviewDevice();
  const [pageId, setPageId] = useState(content.pages.find(page => page.slug === "")?.id ?? content.pages[0]?.id ?? "");
  const [sheetOpen, setSheetOpen] = useState(true);
  const sheet = useSheetGesture(() => setSheetOpen(false));
  const initialBrand = theme.brandColor ?? brandCandidates(theme, variant).find(usableBrandColor) ?? palette.accent;
  const [brandText, setBrandText] = useState(initialBrand);
  const [picker, setPicker] = useState<null | "colors" | "logo">(null);
  const [imagePalette, setImagePalette] = useState<{ colors: string[]; error?: string } | null>(null);
  const [eyeDropper, setEyeDropper] = useState(false);
  const brand = isHexColor(brandText) ? normalizeHex(brandText) : initialBrand;
  const proposals = useMemo(() => paletteProposals(brand), [brand]);
  const selectedStyle: PaletteStyle | undefined = theme.paletteStyle;
  const check = checkPalette(palette);
  const cmsAccent = deriveCmsAccent(brandCandidates(theme, variant));
  const page = content.pages.find(candidate => candidate.id === pageId) ?? content.pages[0];
  const previewPage = page ? { ...page, sections: page.sections.filter(section => section.visible) } : undefined;
  const realHeading = content.pages.find(candidate => candidate.slug === "")?.sections.find(section => section.visible && section.content.heading.trim())?.content.heading || config.name;
  const realText = config.tagline || content.pages[0]?.sections.find(section => section.content.text)?.content.text?.slice(0, 120) || t("So lesen Besucher Ihre Texte.");
  const hasEdits = dirty;
  const pendingBrand = useRef<number | null>(null);
  useEffect(() => { setEyeDropper(typeof window !== "undefined" && "EyeDropper" in window); }, []);
  useEffect(() => () => { if (pendingBrand.current) window.clearTimeout(pendingBrand.current); }, []);

  function setConfig(next: SiteConfig) { onChange({ ...content, config: next }); }
  function setTheme(patch: Partial<SiteConfig["theme"]>) { setConfig({ ...config, theme: { ...theme, ...patch } }); }
  function applyPalette(next: ColorPalette, style: PaletteStyle | undefined, brandColor = brand) {
    setConfig({ ...config, theme: { ...theme, primary: next.primary, accent: next.accent, background: next.background, palettes: { ...theme.palettes, [variant]: next }, paletteStyle: style, brandColor } });
  }
  /** A new brand colour immediately recolours the page with the chosen proposal (coalesced while dragging). */
  function chooseBrand(value: string, immediate = false) {
    setBrandText(value);
    if (!isHexColor(value)) return;
    const run = () => { const style = selectedStyle ?? "clear"; const proposal = paletteProposals(value).find(entry => entry.id === style)!; applyPalette(proposal.palette, style, normalizeHex(value)); };
    if (pendingBrand.current) window.clearTimeout(pendingBrand.current);
    if (immediate) run(); else pendingBrand.current = window.setTimeout(run, 140);
  }
  async function pickFromScreen() {
    try {
      const result = await new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper().open();
      if (result?.sRGBHex) chooseBrand(result.sRGBHex, true);
    } catch { /* cancelled */ }
  }
  async function colorsFrom(url: string) {
    setImagePalette({ colors: [] });
    try {
      const colors = await imageColors(url);
      setImagePalette(colors.length ? { colors } : { colors: [], error: t("In diesem Bild wurde keine deutliche Farbe gefunden. Wählen Sie die Farbe selbst.") });
    } catch {
      setImagePalette({ colors: [], error: t("Die Farben dieses Bildes konnten nicht gelesen werden. Wählen Sie die Farbe selbst.") });
    }
  }

  const fixed = fixPalette(palette);
  const tabs = <div className="cms-design-tabs cms-segmented" role="tablist" aria-label={t("Design-Bereich")}>
    {panels.map(entry => <button key={entry.id} type="button" role="tab" id={"cms-design-tab-" + entry.id} aria-controls="cms-design-panel" aria-selected={panel === entry.id} onClick={() => setPanel(entry.id)}><entry.icon size={16} aria-hidden="true" />{t(entry.label)}</button>)}
  </div>;

  const colors = <>
    <section className="cms-design-group" aria-labelledby="cms-brand-heading">
      <h3 id="cms-brand-heading">{t("Ihre Markenfarbe")}</h3>
      <p className="cms-hint">{t("Wählen Sie die Hauptfarbe Ihrer Marke. Daraus entstehen passende, gut lesbare Farben für die ganze Website.")}</p>
      <div className="cms-brand-picker">
        <label className="cms-brand-swatch" style={{ "--swatch": brand } as CSSProperties}>
          <input type="color" value={brand} aria-label={t("Markenfarbe auswählen")} onChange={event => chooseBrand(event.target.value)} />
        </label>
        <Field label={t("Farbcode")} className="cms-brand-hex"><Input value={brandText} maxLength={7} spellCheck={false} aria-invalid={!isHexColor(brandText) || undefined} onChange={event => chooseBrand(event.target.value.startsWith("#") ? event.target.value : "#" + event.target.value.replace(/[^\da-f]/gi, ""))} onBlur={() => { if (!isHexColor(brandText)) setBrandText(brand); }} /></Field>
      </div>
      <div className="cms-brand-sources">
        {eyeDropper && <Button onClick={() => void pickFromScreen()}><Pipette size={16} aria-hidden="true" />{t("Vom Bildschirm aufnehmen")}</Button>}
        {theme.logo?.url && <Button onClick={() => void colorsFrom(theme.logo!.url)}><Sparkles size={16} aria-hidden="true" />{t("Farbe aus dem Logo")}</Button>}
        <Button onClick={() => setPicker("colors")}><ImageIcon size={16} aria-hidden="true" />{t("Farbe aus einem Bild")}</Button>
      </div>
      {imagePalette && <div className="cms-image-colors" role="group" aria-label={t("Farben aus dem Bild")}>
        {imagePalette.error ? <p className="cms-hint">{imagePalette.error}</p> : !imagePalette.colors.length ? <p className="cms-hint">{t("Farben werden gelesen …")}</p>
          : imagePalette.colors.map(color => <button key={color} type="button" className="cms-image-color" style={{ background: color }} aria-label={t("{p1} als Markenfarbe übernehmen", { p1: color })} onClick={() => { chooseBrand(color, true); setImagePalette(null); }}><span>{color}</span></button>)}
      </div>}
      {!usableBrandColor(brand) && <Notice>{t("Diese Farbe ist sehr hell, sehr dunkel oder grau. Die Vorschläge bleiben neutral; die Verwaltung nutzt ein ruhiges Blau.")}</Notice>}
    </section>
    <section className="cms-design-group" aria-labelledby="cms-proposal-heading">
      <h3 id="cms-proposal-heading">{t("Farbvorschläge")}</h3>
      <div className="cms-palette-proposals" role="radiogroup" aria-labelledby="cms-proposal-heading">
        {proposals.map(proposal => { const result = checkPalette(proposal.palette); const chosen = selectedStyle === proposal.id && theme.brandColor === brand; return <button key={proposal.id} type="button" role="radio" aria-checked={chosen} className="cms-palette-proposal" onClick={() => applyPalette(proposal.palette, proposal.id)}>
          <span className="cms-palette-sample" aria-hidden="true" style={{ background: proposal.palette.background, color: proposal.palette.text, borderColor: proposal.palette.border }}>
            <strong>Aa</strong><i style={{ background: proposal.palette.surface }} /><b style={{ background: proposal.palette.accent, color: result.buttonText }}>{t("Kontakt")}</b>
          </span>
          <span className="cms-palette-meta"><strong>{t(proposal.name)}{chosen && <Check size={15} aria-hidden="true" />}</strong><small>{t(proposal.description)}</small>
            <small className="cms-contrast-ok"><Check size={13} aria-hidden="true" />{t("Gut lesbar · Kontrast {p1}:1", { p1: result.text.toLocaleString(language === "en" ? "en" : "de", { maximumFractionDigits: 1 }) })}</small>
            {proposal.notes.map(note => <small key={note} className="cms-contrast-note"><Wand2 size={13} aria-hidden="true" />{t(note)}</small>)}</span>
        </button>; })}
      </div>
      <p className="cms-design-cms-accent"><span style={{ background: cmsAccent.light.accent }} aria-hidden="true" />{cmsAccent.source === "brand" ? t("Die Verwaltung übernimmt Ihre Markenfarbe automatisch.") : t("Für die Verwaltung wird ein ruhiges Blau verwendet, weil die Markenfarbe kaum Farbton hat.")}</p>
    </section>
    <details className="cms-details cms-design-fine">
      <summary>{t("Farben einzeln anpassen")}</summary>
      <div className="cms-design-fields">
        {([["primary", "Markenfarbe"], ["accent", "Akzentfarbe"], ["background", "Seitenhintergrund"], ["text", "Textfarbe"], ["surface", "Zusätzliche Flächen"], ["border", "Linien und Rahmen"]] as const).map(([key, label]) => <ColorField key={key} label={t(label)} value={palette[key]} onChange={value => { if (value && /^#[\da-f]{6}$/i.test(value)) applyPalette({ ...palette, [key]: value }, undefined, theme.brandColor ?? brand); }} />)}
      </div>
      {check.ok ? <p className="cms-contrast-ok"><Check size={15} aria-hidden="true" />{t("Alle Kombinationen sind gut lesbar (Text {p1}:1, Schaltflächen {p2}:1).", { p1: check.text.toFixed(1), p2: check.button.toFixed(1) })}</p>
        : <Notice tone="error"><div className="cms-design-fix"><span>{t("Einige Farben sind schwer zu lesen (Text {p1}:1, Schaltflächen {p2}:1).", { p1: check.text.toFixed(1), p2: check.button.toFixed(1) })}</span><Button onClick={() => applyPalette(fixed.palette, theme.paletteStyle, theme.brandColor ?? brand)}><Wand2 size={15} aria-hidden="true" />{t("Automatisch korrigieren")}</Button></div></Notice>}
      <Button variant="quiet" onClick={() => { if (comondi) { setConfig(comondiOriginalColors(config)); setBrandText(comondiOriginalPalette.accent); return; } const palettes = { ...theme.palettes }; delete palettes[variant]; setTheme({ palettes, paletteStyle: undefined, brandColor: undefined }); setBrandText(defaultPalettes[variant].primary); }}><RotateCcw size={15} aria-hidden="true" />{t("Originalfarben des Designs")}</Button>
    </details>
  </>;

  const pairing = currentPairing(theme);
  const fonts = <>
    <section className="cms-design-group" aria-labelledby="cms-font-heading">
      <h3 id="cms-font-heading">{t("Schriftkombination")}</h3>
      <p className="cms-hint">{t("Jede Kombination ist auf gute Lesbarkeit geprüft und wird von Ihrer Website selbst ausgeliefert.")}</p>
      <div className="cms-font-pairings" role="radiogroup" aria-labelledby="cms-font-heading">
        {FONT_PAIRINGS.map(entry => <button key={entry.id} type="button" role="radio" aria-checked={pairing === entry.id} className="cms-font-pairing" onClick={() => setTheme({ headingFont: entry.heading, bodyFont: entry.body })}>
          <span className="cms-font-specimen" style={{ "--specimen-heading": cmsTypeface(entry.heading) ?? (theme.font === "dm-sans" ? '"CMS DM Sans", sans-serif' : '"CMS Manrope", sans-serif'), "--specimen-body": cmsTypeface(entry.body) ?? '"CMS DM Sans", sans-serif' } as CSSProperties}>
            <strong>{realHeading}</strong><span>{realText}</span>
          </span>
          <span className="cms-font-meta"><strong>{t(entry.name)}{pairing === entry.id && <Check size={15} aria-hidden="true" />}</strong><small>{t(entry.description)}</small></span>
        </button>)}
      </div>
    </section>
    <section className="cms-design-group" aria-labelledby="cms-scale-heading">
      <h3 id="cms-scale-heading">{t("Schriftgröße")}</h3>
      <div className="cms-segmented cms-design-segmented" role="radiogroup" aria-labelledby="cms-scale-heading">
        {TYPE_SCALES.map(entry => <button key={entry.id} type="button" role="radio" aria-checked={(theme.typeScale ?? "balanced") === entry.id} onClick={() => setTheme({ typeScale: entry.id === "balanced" ? undefined : entry.id })}>{t(entry.name)}</button>)}
      </div>
      <p className="cms-hint">{theme.typeScale === "compact" ? t("Kleinere Überschriften, der Fließtext bleibt gut lesbar.") : theme.typeScale === "generous" ? t("Größere Überschriften und Texte, angenehm auf großen Bildschirmen.") : t("Die Größen, die Ihr Design vorsieht.")}</p>
    </section>
  </>;

  const radius = radiusPreset(theme.radius);
  const style = <>
    {comondi && <ComondiDesignTiles config={config} onChange={setConfig} />}
    {!creator && !comondi && <section className="cms-design-group" aria-labelledby="cms-variant-heading">
      <h3 id="cms-variant-heading">{t("Design")}</h3>
      <p className="cms-hint">{t("Der Grundaufbau Ihrer Website. Texte und Bilder bleiben erhalten.")}</p>
      <div className="cms-design-tiles cms-design-tiles--variants" role="radiogroup" aria-labelledby="cms-variant-heading">
        {([1, 2, 3, 4, 5] as DesignVariant[]).map(value => <Tile key={value} label={t(variantNames[value])} selected={variant === value && !(value === 1 && theme.aesthetic === "liquid-glass")} onSelect={() => setConfig({ ...config, designVariant: value, theme: { ...theme, aesthetic: value === 1 && theme.aesthetic !== "liquid-glass" ? theme.aesthetic : "standard" } })}>
          {Object.values(defaultPalettes[value]).slice(0, 4).map((color, index) => <i key={index} style={{ background: color }} />)}
        </Tile>)}
        <Tile label="Liquid Glass" className="cms-design-tile--glass" selected={variant === 1 && theme.aesthetic === "liquid-glass"} onSelect={() => setConfig({ ...config, designVariant: 1, theme: { ...theme, aesthetic: "liquid-glass" } })}><i /><i /><i /><i /></Tile>
      </div>
    </section>}
    <section className="cms-design-group" aria-labelledby="cms-corner-heading">
      <h3 id="cms-corner-heading">{t("Ecken")}</h3>
      <div className="cms-design-tiles" role="radiogroup" aria-labelledby="cms-corner-heading">
        {RADIUS_PRESETS.map(entry => <Tile key={entry.id} label={t(entry.name)} selected={radius === entry.id} onSelect={() => setTheme({ radius: entry.radius })}><span className="cms-shape-sample" style={{ borderRadius: entry.radius }} /></Tile>)}
      </div>
    </section>
    <section className="cms-design-group" aria-labelledby="cms-button-heading">
      <h3 id="cms-button-heading">{t("Schaltflächen")}</h3>
      <div className="cms-design-tiles" role="radiogroup" aria-labelledby="cms-button-heading">
        {BUTTON_SHAPES.map(entry => <Tile key={entry.id} label={t(entry.name)} selected={(theme.buttonShape ?? "rounded") === entry.id} onSelect={() => setTheme({ buttonShape: entry.id === "rounded" ? undefined : entry.id })}><span className="cms-button-sample" style={{ borderRadius: entry.id === "pill" ? 999 : entry.id === "square" ? 2 : Math.max(4, theme.radius), background: palette.accent, color: checkPalette(palette).buttonText }}>{t("Anfragen")}</span></Tile>)}
      </div>
    </section>
    <section className="cms-design-group" aria-labelledby="cms-density-heading">
      <h3 id="cms-density-heading">{t("Abstände")}</h3>
      <div className="cms-design-tiles" role="radiogroup" aria-labelledby="cms-density-heading">
        {DENSITIES.map(entry => <Tile key={entry.id} label={t(entry.name)} selected={(theme.density ?? "balanced") === entry.id} onSelect={() => setTheme({ density: entry.id === "balanced" ? undefined : entry.id })}><span className={"cms-density-sample cms-density-sample--" + entry.id}><i /><i /><i /></span></Tile>)}
      </div>
      {(variant !== 1 || comondi) && <p className="cms-hint">{t("Abstände wirken im Design „Panorama“. Andere Designs behalten ihren eigenen Rhythmus.")}</p>}
    </section>
    <section className="cms-design-group" aria-labelledby="cms-image-heading">
      <h3 id="cms-image-heading">{t("Bilder")}</h3>
      <div className="cms-design-tiles" role="radiogroup" aria-labelledby="cms-image-heading">
        {IMAGE_STYLES.map(entry => <Tile key={entry.id} label={t(entry.name)} selected={(theme.imageStyle ?? "natural") === entry.id} onSelect={() => setTheme({ imageStyle: entry.id === "natural" ? undefined : entry.id })}><span className={"cms-image-sample cms-image-sample--" + entry.id} /></Tile>)}
      </div>
    </section>
  </>;

  const logo = <LogoPanel config={config} palette={palette} logoVisible={!creator && (variant === 1 || comondi)} hint={comondi ? t("Erscheint oben links und im Fußbereich jeder Seite, in Kosmos und Atlas. Ohne eigenes Logo zeigt die Website das co:mondi-Zeichen. Am besten eine PNG- oder WebP-Datei mit transparentem Hintergrund.") : undefined} onChange={patch => setTheme(patch)} onPick={() => setPicker("logo")} />;

  return <div className={`cms-editor cms-editor--glass cms-design-studio${sheetOpen ? " cms-design-studio--sheet" : ""}`}>
    <h1 className="cms-visually-hidden">{t("Design")}</h1>
    <div className="cms-editor-toolbar">
      <div className="cms-editor-lead">
        {onOpenMenu && <button type="button" className="cms-editor-menu" aria-label={t("Menü öffnen")} aria-haspopup="dialog" aria-controls="cms-admin-navigation" aria-expanded={menuOpen} onClick={event => onOpenMenu(event.currentTarget)}><Menu size={19} aria-hidden="true" /><span>{t("Menü")}</span></button>}
        <div className="cms-page-choice">
          <label htmlFor="cms-design-page" className="cms-visually-hidden">{t("Seite in der Vorschau")}</label>
          <Select id="cms-design-page" value={page?.id ?? ""} onChange={event => setPageId(event.target.value)}>{content.pages.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.title}</option>)}</Select>
          {onOpenEditor && <IconButton label={t("Seiten bearbeiten")} onClick={onOpenEditor}><Pencil size={17} /></IconButton>}
        </div>
      </div>
      <div className="cms-device-switch" role="group" aria-label={t("Vorschaugröße")}>
        {([{ id: "mobile", label: "Handy", icon: Smartphone }, { id: "tablet", label: "Tablet", icon: Tablet }, { id: "desktop", label: "Desktop", icon: Monitor }] as const).map(option => <button key={option.id} type="button" aria-pressed={device === option.id} aria-label={t(option.id === "mobile" ? "Smartphone-Vorschau" : option.id === "tablet" ? "Tablet-Vorschau" : "Desktop-Vorschau")} onClick={() => setDevice(option.id)}><option.icon size={16} aria-hidden="true" /><span>{t(option.label)}</span></button>)}
      </div>
      <div className="cms-editor-subbar"><DraftStatus busy={busy} dirty={hasEdits} pending={pending} english={language === "en"} error={saveError} savedAt={savedAt} /></div>
      <div className="cms-editor-actions">
        <button type="button" className="cms-editor-outline-button" aria-pressed={sheetOpen} onClick={() => setSheetOpen(!sheetOpen)}><SwatchBook size={19} aria-hidden="true" /><span>{t("Design")}</span></button>
        <div className="cms-history-buttons"><IconButton label={t("Rückgängig")} disabled={!canUndo} onClick={undo}><Undo2 size={17} /></IconButton><IconButton label={t("Wiederholen")} disabled={!canRedo} onClick={redo}><Redo2 size={17} /></IconButton></div>
        <Button className="cms-editor-save" onClick={() => void onSave()} busy={busy === "save"} disabled={!hasEdits || Boolean(busy)} aria-label={t("Entwurf speichern")}><Save size={16} aria-hidden="true" /><span className="cms-editor-action-full">{t("Speichern")}</span></Button>
        {onPublish && <Button className="cms-editor-publish" variant="primary" onClick={() => void onPublish()} busy={busy === "publish"} disabled={Boolean(busy) || (!hasEdits && !pending)}><Globe size={15} aria-hidden="true" />{t("Veröffentlichen")}</Button>}
      </div>
    </div>
    <div className="cms-design-panes" data-sheet-open={sheetOpen || undefined}>
      <aside className="cms-design-panel" aria-label={t("Design anpassen")} data-sheet data-detent={sheet.detent} onKeyDown={event => { if (event.key === "Escape" && !(event.target as Element).closest("dialog")) { if (matchMedia("(max-width: 760px)").matches) { event.preventDefault(); setSheetOpen(false); } } }}>
        <div className="cms-sheet-header" {...sheet.handlers}><button type="button" className="cms-sheet-grabber" aria-label={sheet.detent === "large" ? t("Bereich verkleinern") : t("Bereich vergrößern")} onClick={() => sheet.setDetent(sheet.detent === "large" ? "medium" : "large")}><span aria-hidden="true" /></button><button type="button" className="cms-sheet-done" onClick={() => setSheetOpen(false)}><Check size={16} aria-hidden="true" />{t("Fertig")}</button></div>
        <div className="cms-design-intro"><h2>{t("Design")}</h2><p>{t("Änderungen sehen Sie sofort in der Vorschau. Online gehen sie erst mit „Veröffentlichen“.")}</p></div>
        {tabs}
        <div id="cms-design-panel" role="tabpanel" aria-labelledby={"cms-design-tab-" + panel} className="cms-design-body">{panel === "colors" ? colors : panel === "fonts" ? fonts : panel === "style" ? style : logo}</div>
      </aside>
      <section className="cms-preview cms-design-preview" aria-label={t("Live-Vorschau")}>
        <div className={`cms-preview-stage cms-preview-stage--${device}`} inert>
          {previewPage && <PreviewFrame device={device} controls={false}><SiteView page={previewPage} site={config} media={media} variant={variant} editable /></PreviewFrame>}
        </div>
        {!sheetOpen && <button type="button" className="cms-design-reopen" onClick={() => setSheetOpen(true)}><SwatchBook size={17} aria-hidden="true" />{t("Design anpassen")}</button>}
      </section>
    </div>
    {picker && <MediaPicker media={media} onUpload={onUpload} onClose={() => setPicker(null)} onSelect={asset => {
      if (picker === "logo") setTheme({ logo: { url: asset.url, alt: theme.logo?.alt || asset.alt || config.name, showName: theme.logo?.showName ?? true } });
      else void colorsFrom(asset.url);
      setPicker(null);
    }} />}
  </div>;
}

function LogoPanel({ config, palette, logoVisible, hint, onChange, onPick }: { config: SiteConfig; palette: ColorPalette; logoVisible: boolean; hint?: string; onChange: (patch: Partial<SiteConfig["theme"]>) => void; onPick: () => void }) {
  const { t } = useAdminLanguage();
  const logo = config.theme.logo;
  const [zoom, setZoom] = useState(1);
  const [background, setBackground] = useState<"transparent" | "site" | "brand">("site");
  const [favicon, setFavicon] = useState<{ state: "idle" | "busy" | "saved" | "error"; message?: string }>({ state: "idle" });
  const canvas = useRef<HTMLCanvasElement>(null);
  const fill = background === "brand" ? palette.accent : background === "site" ? palette.background : "transparent";
  useEffect(() => {
    const target = canvas.current;
    if (!target || !logo?.url) return;
    let active = true;
    const image = new Image(); image.crossOrigin = "anonymous";
    image.onload = () => {
      if (!active) return;
      const context = target.getContext("2d"); if (!context) return;
      const size = target.width; context.clearRect(0, 0, size, size);
      if (fill !== "transparent") { context.fillStyle = fill; context.beginPath(); context.roundRect(0, 0, size, size, size * .22); context.fill(); }
      const scale = Math.min(size / image.width, size / image.height) * .78 * zoom;
      const width = image.width * scale, height = image.height * scale;
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
    };
    image.src = logo.url;
    return () => { active = false; };
  }, [logo?.url, zoom, fill]);
  async function saveFavicon() {
    const target = canvas.current; if (!target) return;
    setFavicon({ state: "busy" });
    try {
      const blob = await new Promise<Blob | null>(resolve => target.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("canvas");
      const body = new FormData(); body.set("file", new File([blob], "favicon.png", { type: "image/png" }));
      const response = await fetch("/api/workspace-branding/favicon", { method: "PUT", body, credentials: "same-origin" });
      if (response.status === 401 || response.status === 403) { setFavicon({ state: "error", message: t("Nur der Inhaber-Zugang kann das Favicon ändern.") }); return; }
      if (!response.ok) throw new Error(String(response.status));
      setFavicon({ state: "saved" });
    } catch {
      setFavicon({ state: "error", message: t("Das Favicon konnte nicht gespeichert werden. Das Bild muss aus Ihrer Mediathek stammen; versuchen Sie es erneut.") });
    }
  }
  return <>
    <section className="cms-design-group" aria-labelledby="cms-logo-heading">
      <h3 id="cms-logo-heading">{t("Logo")}</h3>
      <p className="cms-hint">{hint ?? t("Erscheint oben links auf jeder Seite im Design „Panorama“. Am besten eine PNG- oder WebP-Datei mit transparentem Hintergrund.")}</p>
      {!logoVisible && <Notice>{t("Ihr aktuelles Design zeigt den Namen als Schriftzug und kein Logo in der Kopfzeile. Das Logo erscheint in „Panorama“ und „Liquid Glass“; als Favicon können Sie es in jedem Design verwenden.")}</Notice>}
      <div className="cms-logo-stage" style={{ background: palette.background, color: palette.text }}>
        {logo?.url ? <img src={logo.url} alt={logo.alt || config.name} /> : <span className="cms-logo-empty"><ImageIcon size={22} aria-hidden="true" />{t("Noch kein Logo")}</span>}
        {(!logo?.url || logo.showName !== false) && <strong>{config.name}</strong>}
      </div>
      <div className="cms-brand-sources"><Button variant="primary" onClick={onPick}><ImageIcon size={16} aria-hidden="true" />{logo?.url ? t("Anderes Logo wählen") : t("Logo auswählen")}</Button>{logo?.url && <Button variant="quiet" onClick={() => onChange({ logo: undefined })}>{t("Logo entfernen")}</Button>}</div>
      {logo?.url && <>
        <Field label={t("Beschreibung des Logos")} hint={t("Für Screenreader, zum Beispiel der Name Ihres Unternehmens.")}><Input value={logo.alt} maxLength={300} onChange={event => onChange({ logo: { ...logo, alt: event.target.value } })} /></Field>
        <Toggle label={t("Namen neben dem Logo zeigen")} checked={logo.showName !== false} onChange={showName => onChange({ logo: { ...logo, showName } })} hint={t("Ausschalten, wenn der Name schon im Logo steht.")} />
      </>}
    </section>
    {logo?.url && <section className="cms-design-group" aria-labelledby="cms-favicon-heading">
      <h3 id="cms-favicon-heading">{t("Favicon aus dem Logo")}</h3>
      <p className="cms-hint">{t("Das kleine Symbol im Browser-Tab. Es wird sofort übernommen und ist nicht Teil des Entwurfs.")}</p>
      <div className="cms-favicon-maker">
        <canvas ref={canvas} width={256} height={256} className="cms-favicon-canvas" aria-label={t("Vorschau des Favicons")} role="img" />
        <div className="cms-favicon-sizes" aria-hidden="true">{[16, 32, 64].map(size => <span key={size} style={{ width: size, height: size }} />)}</div>
      </div>
      <Field label={t("Größe im Symbol · {p1} %", { p1: Math.round(zoom * 100) })}><input type="range" className="cms-range" min="0.6" max="1.3" step="0.05" value={zoom} onChange={event => setZoom(Number(event.target.value))} /></Field>
      <div className="cms-segmented cms-design-segmented" role="radiogroup" aria-label={t("Hintergrund des Symbols")}>
        {([["site", "Seitenfarbe"], ["brand", "Akzentfarbe"], ["transparent", "Transparent"]] as const).map(([value, label]) => <button key={value} type="button" role="radio" aria-checked={background === value} onClick={() => setBackground(value)}>{t(label)}</button>)}
      </div>
      <Button onClick={() => void saveFavicon()} busy={favicon.state === "busy"}><Check size={16} aria-hidden="true" />{t("Als Favicon übernehmen")}</Button>
      {favicon.state === "saved" && <Notice tone="success">{t("Das Favicon wurde übernommen. Browser zeigen es nach dem nächsten Neuladen.")}</Notice>}
      {favicon.state === "error" && <Notice tone="error">{favicon.message}</Notice>}
    </section>}
  </>;
}

