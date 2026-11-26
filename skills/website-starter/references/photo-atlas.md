# Bildatlas

Für ein Architekturportfolio, eine Werkstatt oder eine Redaktion mit aussagekräftiger Fotografie. Eine großformatige Aufnahme eröffnet die Startseite. Am Desktop steht die Überschrift daneben, auf dem Handy folgt sie direkt auf das Bild. Die Navigation erhält dezent durchscheinendes Material. Fließtext, Formulare und das mobile Menü behalten einen deckenden Hintergrund.

## Auswahl und Inhalte

```sh
node scripts/create-site.mjs --name "Atelier" --out "../atelier" --profile portfolio --aesthetic photo-atlas --brief "../atelier-brief.json"
```

Das Briefing kann die Auswahl ebenfalls mit `"aesthetic": "photo-atlas"` speichern. Die Option ergänzt die Profile `services`, `portfolio`, `consulting` und `editorial` in Panorama. Jedes Profil bringt seine eigene Bildauswahl und seine fachlichen Abschnitte mit.

- Übernimm ein freigegebenes Motiv mit `hero.image.file`, `alt` und `position`. Prüfe den seitlichen Ausschnitt am Desktop und den breiteren mobilen Ausschnitt. Beide sollten die Tätigkeit oder das Werk erkennen lassen.
- Schreibe zu der Aufnahme einen konkreten Titel und einen kurzen Einstieg. Führe mit der Hauptaktion zu einer Arbeit, zur Leistung oder zur nächsten Entscheidung. Die nächste Bildgruppe soll ein Detail oder einen zweiten Blick auf das Projekt zeigen.
- Der Ausgangsentwurf verwendet lokale DM Sans, Papierweiß, eine dunkle Schrift und einen hellen Salbeiton. Eigene Farben lassen sich im Briefing vorgeben. Prüfe mit der gewählten Palette die Lesbarkeit aller Links, Buttons und Fokusmarkierungen.
- Bild, Titel, Beschreibungen, Links, Schrift und Ausrichtung bleiben über die vorhandenen CMS-Felder bearbeitbar.

## Abnahme

Teste Hauptaktion und Menü mit Touch und Tastatur. Prüfe eine zweite Seite, eine lange Überschrift und den Fall eines entfernten Fotos. Bei reduzierter Transparenz, erhöhtem Kontrast und erzwungenen Farben muss die Navigation deckend bleiben. Prüfe Galeriewechsel und Anker auch bei reduzierter Bewegung.

Apple beschreibt Material als Mittel, um Bedienung und Inhalte lesbar zu schichten. Bei der Browserabnahme helfen außerdem die Prüfpunkte für Fokus, Ziele und Bewegung. Optional lassen sich die Skills Apple Design Foundations und Apple Design Accessibility sowie die Vercel Web Design Guidelines für die Prüfung verwenden. [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials) · [Apple Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) · [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
