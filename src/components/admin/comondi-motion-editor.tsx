"use client";

import type { ComondiDesign, ComondiMotionSettings, SiteConfig } from "@/lib/types";
import { comondiDesignNames, comondiMotion } from "@/lib/comondi-motion";
import { Field, Select, Toggle } from "./admin-ui";

export function ComondiMotionEditor({ config, onChange }: { config: SiteConfig; onChange: (config: SiteConfig) => void }) {
  const settings = comondiMotion(config.comondiMotion);
  const update = (patch: Partial<ComondiMotionSettings>) => onChange({ ...config, comondiMotion: { ...settings, ...patch } });
  const range = (label: string, field: "intensity" | "speed" | "parallaxStrength" | "revealDuration", min = 0, max = 100, step = 1) => <Field label={label} hint={`${settings[field]}${field === "revealDuration" ? " ms" : " %"}`}><input aria-label={label} type="range" min={min} max={max} step={step} value={settings[field]} onChange={event => update({ [field]: Number(event.target.value) })} style={{ width: "100%", accentColor: "var(--cms-accent, #bc5e9b)" }} /></Field>;
  return <div className="cms-form-section" data-comondi-motion-editor="">
    <h3>Entwurf</h3>
    <Field label="Standard-Entwurf der Website" hint="Kosmos zeigt die dunkle Weltraumszene, Atlas den hellen Kartenentwurf. Im Entwurfsmodus lässt sich auf der Website zusätzlich zwischen beiden wechseln."><Select aria-label="Standard-Entwurf der Website" value={settings.design ?? "kosmos"} onChange={event => update({ design: event.target.value as ComondiDesign })}>{(Object.keys(comondiDesignNames) as ComondiDesign[]).map(design => <option key={design} value={design}>{comondiDesignNames[design]}</option>)}</Select></Field>
    <h3>Space & Bewegung</h3>
    <p>Der Hintergrund bleibt hinter dem Inhalt. Änderungen bleiben bis zum Speichern im Entwurf; veröffentlichte Einstellungen gelten auf allen Seiten.</p>
    <Toggle label="Bewegung aktivieren" checked={settings.enabled} onChange={enabled => update({ enabled })} />
    <Toggle label="Dezenten Space-Hintergrund zeigen" checked={settings.background} onChange={background => update({ background })} hint="Sterne, weiche Lichtnebel und ruhige Orbitlinien hinter dem Inhalt." />
    <Toggle label="Planeten beim Scrollen bewegen" checked={settings.planetScroll} onChange={planetScroll => update({ planetScroll })} />
    <Toggle label="Scroll-Reise durch die Welten" checked={settings.heroJourney !== false} onChange={heroJourney => update({ heroJourney })} hint="Nur im Entwurf Kosmos: Beim Scrollen fliegt die Startseite nacheinander zu den Planeten und zeigt dazu die Themen aus dem Abschnitt „Leistungen“. Ohne Bewegung, ohne diesen Abschnitt und in der Bearbeitung bleibt der Einstieg statisch." />
    <Toggle label="Texte beim Scrollen sanft einblenden" checked={settings.textReveal} onChange={textReveal => update({ textReveal })} hint="Unter Gestaltung lässt sich die Bewegung zusätzlich für jeden Abschnitt einzeln ausschalten." />
    <Toggle label="Interaktionen und Übergänge animieren" checked={settings.interactionFeedback} onChange={interactionFeedback => update({ interactionFeedback })} />
    {range("Stärke des Hintergrunds", "intensity")}
    {range("Geschwindigkeit im Hintergrund", "speed")}
    {range("Scrollbewegung der Planeten", "parallaxStrength")}
    {range("Dauer der Texteinblendung", "revealDuration", 350, 1400, 50)}
    <Field label="Sterne im Hintergrund"><Select aria-label="Sterne im Hintergrund" value={settings.starDensity} onChange={event => update({ starDensity: event.target.value as ComondiMotionSettings["starDensity"] })}><option value="sparse">Wenige Sterne</option><option value="balanced">Ausgewogen</option><option value="dense">Mehr Sterne</option></Select></Field>
    <p>Die Einstellung „Bewegung reduzieren“ des Geräts wird berücksichtigt. In der Bearbeitung bleibt die Vorschau ruhig, damit Texte und Bilder zuverlässig ausgewählt werden können.</p>
  </div>;
}
