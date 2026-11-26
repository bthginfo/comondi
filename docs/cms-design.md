# CMS-Gestaltung · Liquid Glass

Stand 26. November 2026 · Template 1.47.0. Gilt für die Verwaltung unter `/admin` in jedem Projekt aus dem Starter. Die öffentliche Website behält ihre eigene Gestaltung.

## Leitidee

**Die echte Seite ist die Bühne, die Verwaltung schwebt darüber.** Wer das CMS öffnet, sieht seine Website, tippt auf das, was sich ändern soll, ändert es direkt und drückt „Veröffentlichen“. Werkzeuge erscheinen dort, wo gerade gearbeitet wird, und verschwinden mit „Fertig“ wieder. Fachbegriffe kommen nicht vor; „Abschnitt“, „Entwurf“, „Veröffentlichen“, „Design“ und „Medien“ sind die festen Wörter.

Drei Gesten tragen die ganze Bedienung und sind zugleich die Einführung (30 Sekunden, überspringbar):

1. **Antippen** – Text, Bild oder Abschnitt auf der Seite auswählen.
2. **Ändern** – direkt schreiben; Bilder, Links und Farben im Bereich daneben (Handy: unten).
3. **Veröffentlichen** – speichert, zeigt in einer kurzen Prüfung, was online geht, und stellt es live.

## Material

| Ebene | Einsatz | Umsetzung |
| --- | --- | --- |
| Arbeitsfläche | Hintergrund aller Bereiche | `--cms-canvas`, leicht in Markenfarbe getönt, zwei weiche Farbschleier (`--cms-accent-wash`) |
| Inhalt | Karten, Formulare, Listen | `--cms-surface`, deckend, `--cms-shadow-1`, Radius 20 px |
| Glas | Kopfzeile, Werkzeugleisten, Seitenaufbau, Bereich „Bearbeiten“, Dialoge, Tab-Leiste, Hinweise | `--cms-glass(-strong)`, `backdrop-filter: saturate(185%) blur(24px)`, innere Lichtkante `--cms-specular`, `--cms-shadow-2/3` |

Unschärfe nur auf schwebenden Ebenen, nie auf Inhaltskarten. Die Werkzeugleiste trägt ihr Glas auf einem Pseudo-Element, damit die feste Aktionsleiste am Handy nicht im Filter gefangen ist.

Barrierefreiheit: `prefers-reduced-transparency` und `prefers-contrast: more` machen alle Glasflächen deckend und Linien kräftiger, `forced-colors` erhält Rahmen, `prefers-reduced-motion` schaltet Übergänge ab. Text mindestens 12 px (Editor 13–17 px), Ziele mindestens 24 px, am Handy 44 px.

## Akzentfarbe aus der Marke

`src/lib/cms-accent.ts` leitet den Akzent aus der Website ab: gewählte Markenfarbe (`theme.brandColor`), sonst Markenfarbe und Akzent des aktiven Designs. In OKLCH bleibt der Farbton erhalten; Helligkeit und Sättigung werden so verschoben, dass

- weißer Text auf dem Akzent (hell) beziehungsweise dunkler Text (dunkel) mindestens 4,5:1 erreicht,
- Fokusrahmen gegen die Arbeitsfläche mindestens 3:1 erreichen,
- Akzent-Text auf Flächen mindestens 4,5:1 erreicht.

Graue, fast weiße oder fast schwarze Markenfarben haben keinen brauchbaren Farbton; dann gilt ein ruhiges Blau (`#2563c9`). Neonfarben werden gedämpft. Ergebnis sind Variablen `--cms-l-*` (hell) und `--cms-d-*` (dunkel) am Wurzelelement; `cms-glass.css` wählt je nach Darstellung. Die Anmeldeseite nutzt den veröffentlichten Stand, die Verwaltung den Entwurf: Eine neue Markenfarbe färbt das CMS sofort ein.

| Token | Rolle |
| --- | --- |
| `--cms-accent`, `-hover`, `-pressed`, `--cms-on-accent` | gefüllte Schaltflächen, Schalter |
| `--cms-accent-text` | Links, Symbole, aktive Einträge |
| `--cms-accent-tint(-strong)` | ausgewählte Zeilen, Hinweise, „Fertig“ |
| `--cms-ring` | Tastaturfokus |
| `--cms-ink`, `--cms-ink-2`, `--cms-muted`, `--cms-faint` | Text in vier Stufen (die letzte nur für Symbole) |
| `--cms-line(-strong)`, `--cms-fill(-2)` | Linien, ruhige Flächen hinter Bedienelementen |

Darstellung: „Automatisch“ (Systemeinstellung), „Hell“, „Dunkel“ unter **Einstellungen → App & Benachrichtigungen** bzw. **Mein Zugang**; gespeichert nur im Browser. Große Werkzeuge mit eigener Gestaltung (Social-Studio, Planer, Shop, Newsletter, Verein, Coach, Webanalyse, Vorlagen, Termine, Gastronomie, Team, Sicherheit) bleiben hell.

## Typografie, Abstände, Formen, Bewegung

- Schrift: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "CMS Inter", system-ui …` – keine zusätzliche Webfont, „CMS Inter“ ist bereits lokal vorhanden.
- Größen: 12 Hinweis · 13 Beschriftung · 14 Text · 15–17 Überschriften in Bereichen · 19 Abschnitt · 26–30 Seitentitel. Gewichte 500/560/600–700, leicht negative Laufweite für Titel.
- Abstände in 4er-Schritten (4, 8, 12, 16, 20, 24, 32, 40).
- Radien konzentrisch: 8 · 10 (Felder) · 14 · 20 (Karten) · 26 (Bereiche, Dialoge) · Kapsel für Schaltflächen und Leisten.
- Bewegung: Federkurve `cubic-bezier(.32,.72,0,1)`, 160/260/440 ms. Bewegung antwortet nur auf Handlungen (Blatt öffnen, Auswahl, Hinweis).

## Bausteine

- **App-Rahmen:** Desktop gläserne Seitenleiste; Handy Tab-Leiste mit Übersicht, Website, Design, Medien/Social, Mehr.
- **Fokusmodus (Seiten bearbeiten, Design):** Die Navigation wird zur Schublade („Menü“), die Seite bekommt den Platz. Oben eine schwebende Leiste: Menü · Seitenaufbau · Seite · Gerät (Handy/Tablet/Desktop) · Speicherstand · Versionen · Design · Rückgängig/Wiederholen · Speichern · **Veröffentlichen**.
- **Bearbeiten:** Desktop als gläsernes Blatt rechts, öffnet sich beim Antippen, „Fertig“ oder Esc schließt. Häufiges zuerst; Farben, Schrift, Abstände und Bewegung unter „Mehr Gestaltung“. Handy als Blatt von unten mit zwei Höhen (ziehen oder Griff antippen), nach unten ziehen schließt.
- **Abschnitt einfügen:** „+“ an der Unterkante des gewählten Abschnitts öffnet die Abschnittsgalerie (Vorschaubilder, Beschreibung, Suche, zuletzt verwendet, Kategorien).
- **Aktionsleiste am Handy:** Aufbau · Rückgängig · Speichern · Veröffentlichen im Daumenbereich.
- **Veröffentlichen:** ein Knopf; ungespeicherte Änderungen werden zuerst gespeichert. Die Prüfung zeigt „Design geändert: Farben, Schrift“ mit Vorher/Nachher-Miniaturen und je Seite eine Miniatur mit markierten neuen oder geänderten Abschnitten.
- **Hinweise:** gläserne Kapseln über der Tab-Leiste, mit „Erneut versuchen“ bei Fehlern.

## Bereich „Design“

Ein eigener Bereich mit Live-Vorschau (Handy/Tablet/Desktop), Rückgängig und demselben Veröffentlichen-Ablauf:

- **Farben:** Markenfarbe einmal wählen (Farbrad, Farbcode, Pipette in Chromium, Farbe aus Logo oder Bild). Vier Vorschläge „Klar“, „Weich“, „Kräftig“, „Dunkel“ (`src/lib/brand-palette.ts`), jeder mit Kontrastprüfung (AA) und automatischer Korrektur samt Hinweis. Feinabstimmung der sechs Farben mit „Automatisch korrigieren“.
- **Schrift:** neun geprüfte, lokal ausgelieferte Kombinationen als Schriftmuster mit der echten Überschrift der Startseite; Größe „Kompakt · Ausgewogen · Großzügig“ („Kompakt“ verkleinert nur Überschriften, damit nichts unter 12 px fällt).
- **Stil:** Design (fünf Entwürfe und Liquid Glass), Ecken, Schaltflächen, Abstände, Bilder als Kacheln.
- **Logo:** aus der Mediathek, Beschreibung, Name daneben ein/aus; Favicon aus dem Logo mit Größe und Hintergrund (wirkt sofort, nicht Teil des Entwurfs).

Datenformat: optionale Felder in `config.theme` (`brandColor`, `paletteStyle`, `headingFont`, `bodyFont`, `typeScale`, `buttonShape`, `density`, `imageStyle`, `logo`). Fehlen sie, bleibt jede Website unverändert. Die öffentliche Darstellung liest sie über `siteStyleAttributes` (Datenattribute und Variablen am `.ws-site`) und `src/styles/site-style-presets.css`. Abstände und Logo wirken im Design „Panorama“.

## Für abgeleitete Websites

1. `npm run upgrade:site` übernimmt `cms-glass.css`, die neuen Bibliotheken und Komponenten. Eigene Anpassungen an `admin-app.tsx`, `page-editor.tsx`, `canvas-editor-tools.tsx`, `publication-review.tsx`, `section-inspector-controls.tsx`, `site-view.tsx` und `validation.ts` beim Zusammenführen prüfen.
2. Eigene Admin-Stylesheets mit festen Farben auf Tokens umstellen (`var(--cms-surface)`, `var(--cms-ink)` …), sonst bleiben im dunklen Modus helle Inseln mit hellem Text.
3. Eigene Website-Kopfzeilen (andere Designs als „Panorama“) können `theme.logo` selbst darstellen.
4. Keine Daten- oder Schemaänderung. Der Browserlauf `cms-e2e-glass.mjs` prüft Fokusmodus, Design-Bereich und dunkle Darstellung.

## co:mondi

- Der CMS-Akzent entsteht aus dem co:mondi-Pink (`#ed62b9`). Das Navy der Palette ist Seitenhintergrund und wird deshalb übersprungen (`brandCandidates`: eine „Markenfarbe“ mit weniger als 1,3:1 Kontrast zum Hintergrund zählt als Fläche).
- „Design → Stil“ bietet die beiden co:mondi-Entwürfe Kosmos und Atlas statt der Starter-Layouts; „Originalfarben des Designs“ stellt Navy und Pink wieder her.
- Ein im Design-Bereich gewähltes Logo ersetzt das co:mondi-Zeichen in Kopf- und Fußzeile (eigene Farben, Name optional). Schriftkombination und Schriftgröße wirken auf den öffentlichen Seiten über `ComondiPublicSite`.
- Abstände, Bildstil und Ecken der Starter-Layouts gelten für die co:mondi-Abschnitte nur teilweise; der Hinweis unter „Abstände“ sagt das.
