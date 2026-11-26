import type { ContentItem, SectionType } from "./types";

/** The four planets of the service worlds. Each one also chooses the diagram of a service page. */
export const COMONDI_PLANETS = ["jupiter", "neptune", "saturn", "moon"] as const;
export type ComondiPlanet = typeof COMONDI_PLANETS[number];
export const comondiPlanetLabels: Record<ComondiPlanet, string> = {
  jupiter: "Jupiter · Strukturplan",
  neptune: "Neptun · Kreislauf",
  saturn: "Saturn · Brücke",
  moon: "Mond · Phasen",
};

/** 0 Jupiter, 1 Neptune, 2 Saturn, 3 Moon – the same pairing as the explorer and the opening journey. */
export function planetWorld(planet?: string): number {
  const index = COMONDI_PLANETS.indexOf(planet as ComondiPlanet);
  return index < 0 ? 0 : index;
}

const worldIds = ["proven", "modern", "hybrid", "next"];
const worldWords: [RegExp, number][] = [
  [/hybrid|klassisch und agil|verbindung/i, 2],
  [/\bki\b|künstliche intelligenz|nächste welt|entwicklung|orientierung/i, 3],
  [/agil|change|transformation|coaching|moderne welt|scrum|safe/i, 1],
  [/projekt|prozess|anforderung|organisation|bewährte welt|a-spice|systems engineering/i, 0],
];

/** The world a free text names, e.g. "Agile Transformation" → 1. Editors name worlds instead of choosing ids. */
export function worldForText(text?: string): number | undefined {
  if (!text) return undefined;
  return worldWords.find(([pattern]) => pattern.test(text))?.[1];
}

/** The planet of an entry: known world ids first, then the words of its title, finally its position. */
export function entryWorld(entry: Pick<ContentItem, "id" | "title" | "meta">, index: number): number {
  if (worldIds.includes(entry.id)) return worldIds.indexOf(entry.id);
  return worldForText(entry.title) ?? worldForText(entry.meta) ?? index % 4;
}

type SectionField = "heading" | "subheading" | "text" | "quote" | "attribution" | "caption" | "primary" | "secondary";
type ItemField = "title" | "text" | "meta" | "label" | "href" | "email" | "phone" | "tags" | "details" | "image";
export interface ComondiSectionGuide {
  /** Shown above the fields: what each part of the visible section is. */
  hint: string;
  maxItems: number;
  /** Field names as the visitor sees them; null hides a field the section does not show. */
  section: Partial<Record<SectionField, string | null>>;
  item?: Partial<Record<ItemField, string | null>>;
  /** The quote field holds several lines (one fact or entry per line). */
  quoteLines?: boolean;
  /** The section offers the planet choice in its design settings. */
  planet?: boolean;
}

const person = { title: "Name", text: "Wofür ihr euch an diese Person wendet", label: "Rolle", meta: null, href: null, tags: null, details: null, email: "E-Mail-Adresse", phone: "Telefonnummer", image: "Porträt" } as const;
const noContact = { email: null, phone: null } as const;

/** CMS guidance for the co:mondi subpage sections. The renderer reads the same fields. */
export const comondiSectionGuides: Partial<Record<SectionType, ComondiSectionGuide>> = {
  "comondi-map": {
    hint: "Die Landkarte zeigt alle Welten gleichzeitig. Jeder Eintrag ist eine Welt mit Planet, Teilleistungen und Link zur Leistungsseite. Bei vier Einträgen liegen die Welten auf einer gemeinsamen Umlaufbahn um die Mitte.",
    maxItems: 8,
    section: { heading: "Überschrift der Seite", subheading: "Kleine Zeile über der Überschrift", text: "Einleitung", caption: "Beschriftung der Kartenmitte", quote: null, attribution: null },
    item: { title: "Name der Welt", text: "Wann diese Welt passt", meta: "Kategorie (z. B. Bewährte Welt)", label: "Beschriftung des Links", href: "Leistungsseite", details: "Teilleistungen (ein Eintrag je Zeile)", tags: "Passende Methoden", image: null, ...noContact },
  },
  "comondi-pairs": {
    hint: "Jeder Eintrag verbindet zwei Welten. Unter „Verbundene Welten“ stehen die beiden Namen; daraus wählt die Seite die Planeten (Projekt → Jupiter, Agil/Change → Neptun, Hybrid → Saturn, KI → Mond).",
    maxItems: 6,
    section: { quote: null, attribution: null },
    item: { title: "Frage", text: "Antwort", details: "Verbundene Welten (zwei Zeilen)", label: "Beschriftung des Links", href: "Linkziel", meta: null, tags: null, image: null, ...noContact },
  },
  "comondi-formats": {
    hint: "Die Formen liegen als Umlaufbahnen um die Mitte. Der erste Eintrag liegt außen, der letzte am nächsten an eurem Team.",
    maxItems: 6,
    section: { attribution: "Beschriftung der Mitte", caption: "Hinweis unter der Liste", quote: null },
    item: { title: "Form der Begleitung", text: "Beschreibung", meta: "Kurzbezeichnung", label: null, href: null, details: null, tags: null, image: null, ...noContact },
  },
  "comondi-planet-hero": {
    hint: "Einstieg einer Leistungsseite. Den Planeten und das passende Motiv wählt ihr unter „Gestaltung“; er färbt die ganze Seite ein.",
    maxItems: 0,
    section: { heading: "Überschrift der Seite", subheading: "Welt und Thema", text: "Einleitung", primary: "Hauptaktion", secondary: "Zweite Aktion", quote: null, attribution: null, caption: null },

    planet: true,
  },
  "comondi-questions": {
    hint: "Typische Ausgangslagen als Fragen. Besucher können Fragen markieren; die Auswahl wird beim Klick auf die Hauptaktion als Nachricht ins Kontaktformular übernommen.",
    maxItems: 8,
    section: { attribution: "Einstieg: Überschrift", quote: "Einstieg: Text", caption: "Hinweis zur Auswahl", primary: "Aktion mit Auswahl", secondary: null },
    item: { title: "Frage", text: "Kurze Antwort (optional)", meta: null, label: null, href: null, details: null, tags: null, image: null, ...noContact },
  },
  "comondi-service-work": {
    hint: "Was co:mondi konkret tut. Das Motiv folgt dem Planeten unter „Gestaltung“: Jupiter zeigt einen Strukturplan, Neptun einen Kreislauf, Saturn eine Brücke (erster und letzter Eintrag bilden die Ufer), Mond die Phasen.",
    maxItems: 8,
    section: { attribution: "Beschriftung der Mitte oder Wurzel", caption: "Passende Methoden", quote: null },
    item: { title: "Baustein", text: "Beschreibung", meta: "Kurzbezeichnung", details: "Konkrete Tätigkeiten (ein Eintrag je Zeile)", label: null, href: null, tags: null, image: null, ...noContact },
    planet: true,
  },
  "comondi-related": {
    hint: "Verweise auf Beiträge aus den Perspektiven. Titel, Thema, Teaser und Link werden hier gepflegt.",
    maxItems: 6,
    section: { quote: null, attribution: null, caption: null },
    item: { title: "Titel des Beitrags", text: "Teaser", meta: "Thema", label: "Beschriftung des Links", href: "Beitrag", details: null, tags: null, image: null, ...noContact },
  },
  "comondi-next": {
    hint: "Abschluss einer Seite mit Kontaktaktion. Einträge sind Ansprechpersonen; ohne Einträge erscheint nur der Aufruf.",
    maxItems: 4,
    section: { quote: null, attribution: null, caption: null },
    item: person,
  },
  "comondi-route": {
    hint: "Road2Goat als Route. Jeder Eintrag ist eine Etappe; die Reihenfolge bestimmt den Weg.",
    maxItems: 12,
    section: { heading: "Überschrift der Seite", attribution: "Beschriftung am Start", caption: "Beschriftung am Ziel", quote: null },
    item: { title: "Etappe", label: "Leitsatz der Etappe", text: "Beschreibung", details: "Stichpunkte (ein Eintrag je Zeile)", meta: null, href: null, tags: null, image: null, ...noContact },
  },
  "comondi-terms": {
    hint: "Zwei Spalten, die sich gegenüberstehen. Die Zusatzzeile eines Eintrags bestimmt seine Spalte; Einträge mit derselben Zusatzzeile stehen zusammen. Darunter folgt das Tempo.",
    maxItems: 16,
    section: { quote: "Tempo: Leitsatz", attribution: "Tempo: Bezeichnung", caption: "Tempo: Erläuterung" },
    item: { title: "Zusage", text: "Beschreibung", meta: "Spalte", label: null, href: null, details: null, tags: null, image: null, ...noContact },
  },
  "comondi-portraits": {
    hint: "Porträts der Menschen hinter co:mondi. Das Kurzporträt ist erst sichtbar, wenn es ausgefüllt ist; bitte nur freigegebene Angaben eintragen.",
    maxItems: 6,
    section: { heading: "Überschrift der Seite", quote: null, attribution: null, caption: null },
    item: { ...person, details: "Kurzporträt (ein Absatz je Zeile)" },
  },
  "comondi-values": {
    hint: "Die Haltung als Leitworte. Das Leitwort erscheint groß, die Beschreibung daneben.",
    maxItems: 6,
    section: { quote: null, attribution: null, caption: null },
    item: { title: "Leitwort", text: "Beschreibung", meta: "Kurzbezeichnung", label: null, href: null, details: null, tags: null, image: null, ...noContact },
  },
  "comondi-constellation": {
    hint: "Kompetenzen als Sternbild. Jeder Eintrag ist ein Stern; die Reihenfolge bestimmt die Verbindungslinie.",
    maxItems: 8,
    section: { quote: null, attribution: null, caption: null },
    item: { title: "Kompetenz", meta: "Zuordnung", text: "Beschreibung (optional)", label: null, href: null, details: null, tags: null, image: null, ...noContact },
  },
  "comondi-places": {
    hint: "Standorte auf einer Karte. München und Stuttgart werden nach ihrer Lage platziert, weitere Orte gleichmäßig verteilt.",
    maxItems: 4,
    section: { caption: "Beschriftung der Verbindung", quote: null, attribution: null },
    item: { title: "Ort", meta: "Bezeichnung", text: "Anschrift (eine Zeile je Angabe)", label: null, href: null, details: null, tags: null, image: null, ...noContact },
  },
  "comondi-magazine": {
    hint: "Magazinübersicht. Der erste Eintrag wird hervorgehoben; Einträge mit demselben Thema lassen sich gemeinsam filtern.",
    maxItems: 60,
    section: { heading: "Überschrift der Seite", attribution: "Beschriftung der Themenauswahl", caption: "Beschriftung für alle Themen", quote: null },
    item: { title: "Titel des Beitrags", text: "Teaser", meta: "Thema", tags: "Format", label: "Beschriftung des Links", href: "Beitrag", image: "Titelbild (optional)", details: null, ...noContact },
  },
  "comondi-article": {
    hint: "Leselayout eines Beitrags mit Lesefortschritt und Inhaltsverzeichnis. Autor und Datum erscheinen nur, wenn sie eingetragen sind. „Auf einen Blick“: erste Zeile ohne Doppelpunkt ist die Überschrift, danach eine Angabe je Zeile als „Bezeichnung: Wert“.",
    maxItems: 30,
    section: { heading: "Titel des Beitrags", subheading: "Thema", text: "Einleitung", attribution: "Autor oder Autorin", caption: "Datum", quote: "Auf einen Blick", secondary: "Link zur Übersicht" },
    item: { title: "Kapitelüberschrift", text: "Kapiteltext", label: "Beschriftung des Links (optional)", href: "Linkziel (optional)", meta: null, details: null, tags: null, image: null, ...noContact },
    quoteLines: true,
  },
  "comondi-contact": {
    hint: "Kontaktformular mit direkten Ansprechpersonen. E-Mail-Adresse und Anschrift stammen aus den allgemeinen Einstellungen; die Formulartexte stehen unter „Formulartexte“.",
    maxItems: 4,
    section: { attribution: "Überschrift über den Ansprechpersonen", quote: null, caption: null, primary: null, secondary: null },
    item: person,
  },
  "comondi-after": {
    hint: "Was nach dem Absenden einer Anfrage passiert. Die Einträge erscheinen als Verlauf.",
    maxItems: 6,
    section: { quote: null, attribution: null, caption: null, primary: null, secondary: null },
    item: { title: "Schritt", text: "Beschreibung", meta: "Status", label: null, href: null, details: null, tags: null, image: null, ...noContact },
  },
};

export const comondiPageSectionTypes = Object.keys(comondiSectionGuides) as SectionType[];

/** Facts written as "Bezeichnung: Wert" per line; an optional first line without a colon is the title. */
export function factLines(value?: string): { title?: string; facts: { term: string; detail: string }[] } {
  const lines = (value || "").split("\n").map(line => line.trim()).filter(Boolean);
  const title = lines[0] && !lines[0].includes(":") ? lines.shift() : undefined;
  return {
    title,
    facts: lines.map(line => {
      const split = line.indexOf(":");
      return split < 0 ? { term: "", detail: line } : { term: line.slice(0, split).trim(), detail: line.slice(split + 1).trim() };
    }),
  };
}

/** The contact link of the questions section carries the chosen questions as an editable message. */
export function questionsHref(href: string | undefined, questions: string[], intro = "Diese Fragen beschäftigen uns:"): string {
  const base = href || "/kontakt";
  if (!questions.length) return base;
  const message = `${intro}\n${questions.map(question => `– ${question}`).join("\n")}`;
  return `${base}${base.includes("?") ? "&" : "?"}message=${encodeURIComponent(message)}`;
}

/** Topics of the magazine in order of first appearance. */
export function magazineTopics(items: Pick<ContentItem, "meta">[]): string[] {
  return [...new Set(items.map(item => item.meta?.trim()).filter((topic): topic is string => Boolean(topic)))];
}
