# Qualitätsmaßstab für öffentliche Seiten

Dieser Maßstab ist die messbare Untergrenze jeder Website aus dem Starter. Er ersetzt keine gestalterische Idee aus [Design und Inhalte](design-and-content.md), sondern verhindert, dass eine gute Idee an Details scheitert: zu kleine Schrift, verrutschte Szenen, fehlende Hauptaktion, Platzhalter im Livegang.

## Prüfablauf

1. Lokale Vorschau starten (`npm run dev`) und in einem zweiten Terminal `npm run review:visual -- http://localhost:3000` ausführen. Ohne Pfade prüft das Skript die Startseite und bis zu vier verlinkte Unterseiten. `--design 1…5` wählt ein Ausgangslayout, `--tablet` ergänzt 834 px, `--pages <n>` ändert die Seitenzahl.
2. In `.checks/visual/<zeitpunkt>/` die **Kontaktbögen** (`*-bogen-*.png`) für Desktop und Smartphone tatsächlich ansehen. Sie zeigen jede Bildschirmhöhe der Seite nebeneinander, auch Zwischenzustände von Scroll-Szenen. Dazu `*-0-mit-einwilligung.png` (erster Bildschirm mit Einwilligungsdialog) und `*-mobile-ruhig.png` (reduzierte Bewegung).
3. `report.md` lesen. **Fehler** vor jeder Abnahme beheben. Jeden **Hinweis** entweder beheben oder im Abschlussbericht begründen.
4. Nach Korrekturen erneut prüfen. Vor dem Livegang dieselbe Prüfung gegen die echte Domain laufen lassen.

Playwright wird nicht als Projektabhängigkeit mitgeliefert. Ist es nicht vorhanden, nennt das Skript die einmalige Einrichtung.

## Messbare Untergrenzen

### Typografie

- Fließtext mindestens 16 px, längere Lesetexte am Desktop 17–19 px, Zeilenhöhe 1,45–1,7, Zeilenlänge etwa 45–75 Zeichen.
- Der Einstiegstext unter der Hauptüberschrift ist am Desktop mindestens 18 px groß. Eine 120-px-Headline neben einem 13-px-Absatz wirkt unfertig.
- Sekundärtexte wie Bildunterschriften, Metadaten, Formularhilfen, Footer und rechtliche Links mindestens 12 px. 11 px nur für kurze Versal-Labels mit Laufweite. Nie darunter, auch nicht für Markenzusätze im Header.
- Schriftgrößen neuer Layouts kommen aus der gemeinsamen Skala in `src/styles/site.css` (`--ws-text-xs` 12 px, `--ws-text-sm` 14 px, `--ws-text-base` 16 px, `--ws-text-read` 17 px, `--ws-text-lede` 18–20 px, `--ws-heading-s` bis `--ws-heading-xl`). Feste Pixelwerte nur mit Begründung; die Tabelle steht in `DESIGN.md` unter „Öffentliche Typografie“.
- Höchstens zwei Schriftfamilien, optional eine Monospace für Daten. Jede Familie wird lokal ausgeliefert und vollständig geladen. Eine Glyphen-Schrift (etwa ein Logo-Buchstabe über `unicode-range`) steht im Stack nur vor einer vollwertigen Markenschrift, nie direkt vor `sans-serif`. Sonst erscheinen alle übrigen Zeichen in einer Systemschrift.
- Markenschriften für Überschriften mit `font-display: swap` oder `fallback` laden und nur die tatsächlich verwendeten Schnitte vorladen. `optional` lässt die Systemschrift bei langsamer Verbindung dauerhaft stehen. Die visuelle Prüfung meldet, welche Schrift Chromium wirklich gezeichnet hat, und als Fehler jeden Schriftstapel, dessen erste Familie weder eine deklarierte Schrift noch eine Systemschrift ist. Das betrifft etwa die Variablen von `next/font`: Sie tragen je nach Bundler einen erzeugten Namen. Schriften deshalb im CSS mit ihrem echten Familiennamen ansprechen.
- Große Überschriften am Desktop ohne Silbentrennung. Lieber umformulieren, die Spalte verbreitern oder den Schriftgrad anpassen. Auf dem Smartphone ist die Trennung langer Komposita erlaubt.
- Genau eine sichtbare H1 je Seite.

### Kontrast

- Text mindestens 4,5:1, große Schrift ab 24 px mindestens 3:1. Das gilt auch für Grau auf dunklem Grund, Text auf Fotos und Bedienelemente in eingebetteten Demos.
- Sekundäre Buttons auf Fotos erhalten eine eigene Fläche oder einen Verlauf darunter. Ein dünner Rahmen auf unruhigem Bild reicht nicht.

### Erster Bildschirm

- Desktop (1440 × 900) und Smartphone (390 × 844) zeigen ohne Scrollen: das Angebot in Klartext als H1, eine Hauptaktion als Button außerhalb der Navigation und das Hauptmotiv. Auf dem Smartphone mindestens H1 und Hauptaktion.
- Der Einwilligungsdialog verdeckt weder H1 noch Hauptaktion vollständig.
- Ein Bedienelement im Header (etwa ein Theme-Schalter) verdrängt auf dem Smartphone nicht Logo oder Menü.

### Inhalt und Belege

- Spätestens im zweiten Bildschirm ein überprüfbarer Beleg: Arbeitsprobe, echte Produktansicht, nachvollziehbarer Ablauf, Kennzahl mit Quelle oder freigegebene Kundenstimme.
- Keine wiederholten Aussagen. Zwischenüberschrift und Abschlussaufruf formulieren unterschiedliche Fragen.
- Nummerierte Abfolgen vollständig und in sich schlüssig. Raster mit 1, 2, 3 und mehr Einträgen prüfen.
- Dienstleistungsseiten beantworten vor dem Abschlussaufruf die drei Entscheidungsfragen: Was kostet es ungefähr oder wovon hängt es ab, wie läuft es ab, wie lange dauert es.
- Fiktive Beispiele bleiben als Beispiele gekennzeichnet. Vor dem Livegang keine Musterdaten wie `example.invalid`, Musterstraße oder `+49 000` mehr.

### Bewegung und Scroll-Szenen

- Jede Szene hat einen ruhigen, vollständig lesbaren Anfangs- und Endzustand. Kein Zwischenstand mit halb abgeschnittenen Überschriften, verzerrten Bildern oder leeren Flächen über mehr als eine halbe Bildschirmhöhe. Jede Stufe im Kontaktbogen prüfen.
- Eine gepinnte Szene dauert höchstens etwa 2,5 Bildschirmhöhen und bietet einen Sprung zum nächsten Abschnitt.
- Bedienelemente einer Szene bleiben nicht über dem folgenden Abschnitt stehen.
- Nach vollständigem Scrollen ist kein Inhalt mehr unsichtbar. Bei reduzierter Bewegung ist alles sofort sichtbar.

### Bedienung

- Hauptaktionen und Navigation mindestens 44 × 44 px groß, kein Bedienelement unter 24 × 24 px.
- Sichtbarer Fokus und vollständiger Tastaturweg durch Navigation, Menü, Tabs und Formular.
- Formulare zeigen Senden, laufenden Versand, bestätigten Erfolg und Fehler mit erhaltenen Eingaben.
- Eingebettete Demos zeigen beim Laden ein Vorschaubild oder Skelett statt einer leeren Fläche.

### Bilder und Ladezeit

- Hauptmotiv als AVIF oder WebP, möglichst unter 250 KB, mit passenden `sizes`. Vorrang nur für das Hauptmotiv, alles darunter lädt verzögert.
- Startseite auf dem Smartphone möglichst unter 1,5 MB Übertragung. Lokale Richtwerte: LCP bis 2,5 s, CLS bis 0,1. Werte echter Besucher in Speed Insights prüfen.
- Keine unscharfen Bilder (Quelle kleiner als 0,7 × Anzeigegröße × Pixeldichte) und keine stark übergroßen Dateien.
- Videos mit Poster, ohne automatisches Vorladen der ganzen Datei, pausiert außerhalb des Sichtbereichs.

### Technik und Auffindbarkeit

- Keine Konsolenfehler, keine fehlgeschlagenen Anfragen.
- Titel 15–65 Zeichen, Beschreibung 70–160 Zeichen, eigene kanonische Adresse, Vorschaubild und Sprachattribut je URL.
- Keine unersetzten Platzhalter wie `{year}`, `{name}`, `undefined` oder Blindtext.
- Genau ein `main`-Bereich. Bearbeitungselemente des CMS erscheinen nie im öffentlichen HTML.

## Gestalterische Gegenprobe

Messwerte allein machen keine hervorragende Website. Bewerte nach der Prüfung jede Dimension von 1 bis 5 und halte die Werte im Abschlussbericht fest. Veröffentlicht wird erst, wenn keine Dimension unter 4 liegt.

| Dimension | Woran 5 erkennbar ist |
| --- | --- |
| Idee | Ohne Logo bleibt erkennbar, für wen und wofür die Seite gemacht ist. Ein Element ist eindeutig projekteigen. |
| Typografie | Klare Rangfolge mit wenigen Größen, sauberer Zeilenfall, keine Waisen in Überschriften, ruhige Laufweiten. |
| Rhythmus | Abschnitte wechseln Maßstab und Dichte bewusst. Weißraum trennt Gedanken, keine zufälligen Lücken. |
| Bildregie | Ausschnitte sind pro Gerät gewählt, Motive tragen Inhalt, Licht und Farbe passen zusammen. |
| Interaktion | Die wichtigste Handlung ist vollständig ausgearbeitet und gibt sichtbares Feedback. Bewegung erklärt eine Veränderung. |
| Lesbarkeit | Alle Untergrenzen oben sind erfüllt. Die Seite lässt sich in 30 Sekunden überfliegen. |
| Vertrauen | Belege, Ansprechperson, Ablauf, Preise oder Preislogik und rechtliche Angaben sind leicht zu finden. |
| Smartphone | Eigene Komposition statt gestapelter Desktopseite. Daumenreichweite und Ladezeit sind berücksichtigt. |

## Häufige Befunde und ihre Lösung

| Befund | Lösung |
| --- | --- |
| Hellgraue 12–13-px-Absätze auf dunklem Grund | Absatz auf 16–18 px, Farbe auf mindestens 4,5:1 anheben. Hierarchie über Größe und Gewicht statt über Blässe bilden. |
| Überschriften fallen auf eine Systemschrift zurück | Schriftstapel um die vollwertige Markenschrift ergänzen und die Datei lokal laden. |
| Scroll-Szene zeigt zwischendurch leere Fläche oder Fragmente | Zustände neu takten, Zwischenstufen mit Inhalt füllen oder die Szene kürzen. |
| Startbildschirm ohne Hauptaktion | Primären Button in den Einstieg setzen. Die Navigation ersetzt ihn nicht. |
| Footer, Bildunterschriften, Tagline in 6–10 px | Auf 12 px anheben oder den Inhalt streichen. |
| Abschluss wiederholt eine frühere Überschrift | Abschluss als konkrete nächste Handlung formulieren, etwa „Termin für ein Erstgespräch wählen“. |
| Demo-Iframe zeigt beim Laden nur „wird geöffnet …“ | Standbild der Demo als Platzhalter, danach austauschen. |
| Großes Hauptmotiv als PNG oder JPEG über 500 KB | Als AVIF oder WebP in passenden Breiten ausliefern, `sizes` setzen. |
