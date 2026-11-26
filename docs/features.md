# Funktionskatalog

„Enthalten“ bedeutet: Der Starter besitzt ausführbaren Code. „Bauanleitung“ bedeutet: Codex muss die Funktion bei einem entsprechenden Auftrag noch implementieren, einrichten und prüfen.

| Funktion | Stand | Konfiguration / Einstieg |
| --- | --- | --- |
| Zentrale Speisen- und Getränkekarte | Enthalten, optional | Kategorien, Einträge und Portionspreise zentral oder aus der Vorschau pflegen. Drei Kartenlayouts in der Abschnittsbibliothek. [Anleitung](hospitality.md) |
| Tischreservierungen | Enthalten, optional | Tische, Kapazitäten, Buchungsfenster und Schließtage, manuelle Zusagen und Absagen, drei Widget-Layouts. [Anleitung](hospitality.md) |
| Visuelles CMS, Seiten und Abschnittsbibliothek | Enthalten | `/admin`, `src/components/admin/`. Seit 1.47.0 im Liquid-Glass-Look mit Akzent aus der Markenfarbe. [CMS-Gestaltung](cms-design.md) |
| Design-Bereich: Markenfarbe, Farbvorschläge, Schriften, Stil, Logo | Enthalten seit 1.47.0 | CMS → Design. Live-Vorschau, Kontrastprüfung, Veröffentlichung über die gewohnte Prüfung. [CMS-Gestaltung](cms-design.md) |
| Karten, FAQ und andere Listen pflegen | Enthalten | Im Abschnitt hinzufügen, duplizieren, suchen, sortieren oder mehrere Titel einfügen. Das Raster passt sich der Anzahl an. |
| Interne Links bei Adressänderungen | Enthalten | Wird eine Seitenadresse oder Sprungmarke im Entwurf geändert, folgen passende interne Links. |
| Einstellungen suchen | Enthalten | Im Einstellungsbereich nach Begriffen wie SMTP, Schriften oder Consent suchen. |
| Speichern, Vergleich mit der Live-Fassung, Veröffentlichen, Konflikte, Versionen, Undo/Redo | Enthalten | CMS und `src/lib/db.ts`. Seit 1.46.0 mit Neuanmeldung ohne Datenverlust, Tab-Abgleich, lokaler Sicherungskopie und Vorschau aus der Veröffentlichungsprüfung. |
| Gemeinsame öffentliche Schriftskala | Enthalten seit 1.45.0 | Tokens `--ws-text-xs` bis `--ws-heading-xl` auf `.ws-site`; das Basislayout nutzt sie für Fließtext, Einstieg, Bildunterschriften, Fußbereich und Formularhilfen. [Öffentliche Typografie](../DESIGN.md) |
| Farben, Typografie, Navigation, Footer, fünf Ausgangslayouts | Enthalten | CMS, profilspezifischer Einstieg bei neuen Projekten und [Designstandard](../skills/website-starter/references/design-and-content.md) für die individuelle Gestaltung |
| Vollständige Startseiten je Profil | Enthalten seit 1.45.0 | `services`, `portfolio`, `consulting` und `editorial` starten mit sieben bis acht bearbeitbaren Abschnitten: Angebot, Beleg (als Beispiel gekennzeichnet), Ablauf, Ansprechperson, FAQ zu Preislogik, Dauer und Ablauf sowie Abschlussaufruf; `editorial` mit drei Beispielbeiträgen. Jedes Profil hat einen eigenen Rhythmus. |
| Ausführbare Frontend-Beispiele | Eigenständige Beispielprojekte für Objektstudio, Musikprogramm und Feldjournal | `--example` im neutralen Generator. [Komposition und Beispiele](../skills/website-starter/references/frontend-directions.md) |
| Visuelle Abnahme und Qualitätsmaßstab | Enthalten; nutzt eine vorhandene Playwright-Installation | `npm run review:visual -- http://localhost:3000`: Bildschirmfolgen, Kontaktbögen, axe, Schriftgrößen, Schrift-Fallbacks und nicht geladene Schriftfamilien, Überlauf, Platzhalter, Hauptaktion, Ladewerte. [Qualitätsmaßstab](../skills/website-starter/references/quality-bar.md) |
| Liquid Glass · iOS mit räumlicher Tiefe | Enthalten, ausdrückliche Gestaltungsoption für die vier Standardprofile | CMS Gestaltung oder `--aesthetic liquid-glass`; [Anleitung](recipes/liquid-glass.md). Schwebende Glaskapsel als Navigation, geschichtete Glasflächen, Lichtfeld; deckend bei „Transparenz reduzieren“. Bisherige Vorgaben bleiben erhalten. |
| Medienbibliothek, Alt-Text, Fokus, Rasterbild-Upload | Enthalten; live mit eigenem Blob-Store, lokal ohne Blob-Store in `.data/media` | CMS Medien. Zeigt, wo ein Bild verwendet wird, und fragt nach dem Hochladen die Bildbeschreibung ab. |
| Galerien, Lightbox, Team, Leistungen, FAQ, Abläufe, Downloads | Enthalten | Abschnittsbibliothek; Downloads verlinken eigene Dateien |
| Blog, Beitragsstatus und drei Teaser-Layouts | Enthalten, standardmäßig aus | Beiträge, Abschnittsbibliothek und Seitenvorlagen |
| Seitenvorlagen für Blogübersicht, Beitragsdetail, Produktdetail, Kategorie und Suche | Enthalten | CMS Seitenvorlagen. Shop-Vorlagen erscheinen nach Einrichtung des Shops. |
| Ankündigung mit Zeitraum und Link | Enthalten | Abschnittsbibliothek |
| Animierter Hero mit 3D-Szene | Enthalten, einzeln hinzufügbar | Abschnittsbibliothek → Cinematic |
| Anfrageformular, Postfach, Notizen, Status, CSV | Enthalten | `/api/contact`, CMS Anfragen |
| SMTP-Benachrichtigungen | Enthalten, standardmäßig aus | Eigene SMTP-Verbindung im CMS |
| Karten, Videos und Einwilligungen | Enthalten | Externe Medien erst nach Zustimmung |
| GA4 / Matomo | Enthalten, ohne vorkonfigurierte IDs | CMS; Einwilligung und tatsächliche Einrichtung nötig |
| SEO, Sitemap, Robots, Open Graph, JSON-LD, `llms.txt` | Enthalten | Seiten-/Site-Einstellungen; JSON-LD passend zum Betrieb erweitern |
| Suchergebnis-Titel und Meta-Beschreibungen prüfen | Enthalten | Übersicht → Startcheck. Hinweise zu fehlenden und wiederholten Angaben. |
| Inhaber-Zugang und persönliche Teamzugänge | Enthalten | Team & Zugänge. Redaktion bearbeitet Entwürfe, das Shop-Team wickelt Bestellungen ab. |
| Betriebscheck mit letzten gespeicherten Bestätigungen | Enthalten | Übersicht. E-Mail-Test, Zahlungsstand und Zustand aktiver Social-Kanäle. |
| Kontrollierte Starter-Updates und verschlüsselte Sicherung | Enthalten | [Wartung und Wiederherstellung](maintenance.md) |
| Newsletter mit Design-Editor, Empfängergruppen, Double-Opt-in, Abmeldelink und Versandstatus | Enthalten, optional und standardmäßig aus | [Newsletter einrichten](newsletter.md) |
| Social-Studio für Beiträge, Bildfolgen und kurze Reels | Enthalten, optional und standardmäßig aus; unabhängig vom Profil | [Social-Studio](social-studio.md), CMS Einstellungen → Allgemein. Formatkopie, Mediensuche und Austausch im Rahmen. |
| Post-Planer und native Kanal-Connectoren | Optional enthalten, standardmäßig aus; benötigt Social-Studio, eigene Kanal-/App-Einrichtung und Queue | [Post-Planer](social-publishing.md), [Connectoren](social-connectors.md); Planung funktioniert auch unkonfiguriert |
| CMS-Assistent für gespeicherte Daten und bestätigte Aktionen, Texte, Seitenaufbau und Social-Entwürfe | Arbeitsbereich im Admin enthalten. Modellgestützte Vorschläge mit eigenem Anbieter. | [CMS-Assistent](ai-assistant.md); eigene bearbeitbare Nutzen-Section, öffentliche Beispiele ausschließlich lokal simuliert |
| Angebots- und Terminvorschläge mit persönlichem Freigabelink | Optional enthalten | Einstellungen → Projektfreigaben. Entscheidung erscheint in der Anfrage. Kalender, Kundenportal und Rechnungsprozess sind eigene Erweiterungen. |
| Podcast-RSS, Archiv, redaktionelle Overrides, Sync | Bauanleitung aus Amélie | [Podcast](recipes/podcast.md) |
| Bewertungen von externem Anbieter | Bauanleitung | [Bewertungen](recipes/reviews.md) |
| Visitenkarten / Druckstudio mit PDF-Ausgabe | Bauanleitung aus Amélie | [Druckstudio](recipes/print-studio.md) |
| Einzeltermine und Erstgespräche | Enthalten, optional | CMS Termine. Freie Zeitfenster, Buchung, Umbuchung, Absage, E-Mail und optionaler Push. [Anleitung](recipes/consultations.md) |
| Kundenportal, CRM, Angebote, Rechnungen, Outbox | Bauanleitung; Kantiq vor Wiederverwendung erneut prüfen | [Portal und CRM](recipes/portal-crm.md) |
| Creator-Profil, optionale Creator-Abschnitte, isoliertes echtes Demo-CMS | Enthalten, nur ausdruecklich aktiviert | [Creator-Module](creator-modules.md) |
| Creator Media Kit mit Kooperationsanfragen | Enthalten im Creator-Profil | Seite „Media Kit“ oder Startlayout im Editor. Kennzahlen und Zeitraum redaktionell pflegen. |
| Shop mit Stripe Checkout, optionalem PayPal über Stripe, privaten Downloads und Bestellungen | Optionaler Kern enthalten. Händlerkonto, Webhook und Testkauf pro Projekt prüfen. | Shop und [Einrichtung](recipes/commerce.md) |
| Shop-Vorschauen und Partnerlinks | Enthalten | Shop sofort ein- oder ausblenden. Kasse, Status, PDF und E-Mails mit Beispielprodukten prüfen. Partnerlinks im Editor kennzeichnen. |
| Elektronischer Widerruf mit Bestätigung per E-Mail | Optional im Shop. Das Formular legt eine Nachricht im Anfragepostfach ab. | Einstellungen → Shop. Testwiderruf vor dem Start durchführen. |
| Offizielle Social-Quellen | Adaptervertrag vorhanden; Anbieteradapter je Kunde gesondert implementieren | [Creator-Module](creator-modules.md) |
| Deutsch und Englisch für Website und CMS | Enthalten. Beide Standardsprachen sind separat im CMS einstellbar | [Mehrsprachigkeit](recipes/multilingual.md) |
| Coach Studio für Rugby-Taktiken | Enthalten als eigenständiges Opt-in | [Coach Studio](coach-studio.md) |
| Vereinsverwaltung und privater Mitgliederbereich | Enthalten als eigenes Opt-in, unabhängig vom Coach Studio | [Club management](club-management.md): Rollen, Einladungen, Teams, Detailseiten, Termine, Ergebnisse, News, Nachrichten, Darstellung, App und Push |
| Interaktive 3D-Scroll-Story | Ausdrückliches Opt-in in jedem Profil | [3D-Scroll-Story](recipes/3d-scroll-story.md) mit kontinuierlicher GLB-Animation, Kapitelgestaltung und Browser-Abnahme |
| CMS als installierbare App, geführte Tour und Favicon/Appsymbole | Im Kern enthalten, Push je Gerät freiwillig. Die Tour zeigt fünf Kernaufgaben; optionale Bereiche erklärt die Hilfe. | [App & notifications](workspace-apps.md) |

Ein Briefing kann jede dieser Funktionen anfordern. Der Skill verwendet den vorhandenen Kern und ergänzt nur die konkret benötigten Erweiterungen. Keine leeren Menüpunkte oder scheinbar aktiven Funktionsschalter anlegen.

Die gemeinsame Verwaltung und der visuelle Wochenplaner sind in [Admin-Arbeitsbereich](admin-workspace.md) beschrieben. Die Einrichtungshilfe ist bei Bedarf erreichbar; bestehende Modul- und Veröffentlichungsgrenzen bleiben erhalten.

Für Upgrades und neue Websites die [gemeinsamen Modulabläufe](../skills/website-starter/references/admin-modules.md) als Abnahmematrix nutzen.

### Admin-Usability · 1.12.2

Gemeinsamer Schutz vor dem Verwerfen lokaler Dialogeingaben, mobile Studio-Werkzeuge ohne überlagernde globale Navigation und Zahlenbearbeitung mit erlaubten Zwischenständen. Details und Prüfgrenzen stehen in [Admin-Arbeitsbereich](admin-workspace.md). Kunden-/Finanzabläufe bleiben eine gesonderte Umsetzung nach [Portal-/CRM-Rezept](recipes/portal-crm.md), kein automatisch aktiviertes Starter-Modul.

## Visuelle Abschnitte

Unter **Abschnitt hinzufügen** stehen diese visuellen Bausteine für alle Profile bereit.

- **Bildbühne** mit großer Überschrift, einem eigenen Motiv und bis zu zwei Aktionen. Unter **Gestaltung** stehen Panorama, Porträtfokus und eine Anordnung nebeneinander zur Wahl.
- **Fotogeschichte** mit einem Motiv, das auf breiten Bildschirmen stehen bleibt und beim nächsten Kapitel sanft wechselt. Auf schmalen Bildschirmen und bei reduzierter Bewegung stehen die Kapitel mit ihrem jeweiligen Bild untereinander.
- **Szenenwechsel beim Scrollen** mit großflächigen Bildern und Texten. Beim Scrollen schieben sich die Szenen seitlich aus der Bühne. Auf kleinen Bildschirmen und bei reduzierter Bewegung sind die Szenen direkt untereinander lesbar.
- **Animierter Ablauf** für eine Beispielanfrage, Freigabe oder Übergabe. Besucher können zu einem Schritt springen, den Ablauf pausieren und weiterschalten. Die automatische Wiedergabe läuft im sichtbaren Bereich bei aktivierter Bewegung.
- **Projektgalerie** mit einem großen Motiv, Beschreibung und optionalem Link je Eintrag. Mit den Pfeilen lässt sich auch auf dem Smartphone zwischen Einträgen wechseln.
- **Filterbare Projektübersicht** mit einem großen Auftaktprojekt und einer Übersicht der weiteren Arbeiten. Projekte derselben Kategorie erscheinen unter einem Filter.
- **Themenverzeichnis** mit übersichtlichen Zeilen für Titel, Erklärung, kleines Bild und Link. Es eignet sich für Leistungen, Themen und redaktionelle Empfehlungen.

Die Startseiten der vier Standardprofile setzen diese Bausteine zu einer vollständigen Seite zusammen; Personen, Projekte, Kennzahlen und Beiträge sind bis zum Austausch als Beispiel gekennzeichnet. Die Kennzeichnung „Beispielmotiv“ liegt als kleines Etikett auf dem Bild. Das Profil `services` verwendet auf der Leistungsseite die klickbare **Leistungen**-Übersicht. Beim Wechsel passt sich das Bild zusammen mit der Beschreibung an. `consulting` startet mit einem Szenenwechsel und zeigt einen animierten Ablauf unter `/ablauf`. `portfolio` zeigt auf der Projektseite die filterbare Übersicht.

Im Seiteneditor sind Kapitel und Galerieeinträge direkt zugänglich. Unter **Gestaltung** lassen sich Farben, Abstände, Bildseite und Bewegung einstellen. Ersetzen Sie die lokalen, generierten Beispielmotive und Texte vor dem öffentlichen Start.

Sanfte Einstiege sind Bestandteil der Ausgangsgestaltung. Ausgewählte Texte und Karten erscheinen einmal beim Eintritt in den Sichtbereich. Bedienbare Karten und Buttons geben Feedback für Zeiger und Tastatur. Die Einstellung „Sanft einblenden“ liegt im Abschnitt; „Keine Animation“ und die Systemeinstellung für reduzierte Bewegung deaktivieren sie. Scroll-Szenen behalten eigene Bewegungsabläufe.

## Animierter Hero

Wählen Sie **Abschnitt hinzufügen → Cinematic → Animierter Hero**. Die mitgelieferte 3D-Szene zeigt den Aufbau eines Sideboards aus Nussbaum. Über **Animation startet** wählen Sie die automatische Schleife oder die Kamerafahrt beim Scrollen. **Animation testen** zeigt die Bewegung schon im Entwurf. Überschrift, Text, Links und Standbild bleiben bearbeitbar.

Für eine eigene Szene legt das Projektteam eine GLB-Datei unter `public/assets/motion-story/models/` ab. Sie enthält Geometrie, Texturen und mindestens einen Animationsclip. Der Hero spielt den ersten Clip und übernimmt eine eingebettete Perspektivkamera, falls vorhanden. Hinterlegen Sie den öffentlichen Modellpfad und das Standbild im Editor. Das Standbild erscheint auch bei reduzierter Bewegung oder wenn der Browser WebGL nicht bereitstellt. Die Render-Schleife pausiert außerhalb des Sichtbereichs.

Die Modi **Material verwandeln** und **Elemente zusammenführen** stehen weiterhin für freigestellte PNG- und WebP-Motive zur Verfügung. Vorhandene Abschnitte behalten ihre gewählte Darstellung.

## Vorlagen und Sortiment (1.13.0)

[Dokument-Studio, E-Mail-Vorlagen und Sortiment](business-studio.md): echte PDF-Vorschau, Logo und Layout, bearbeitbare automatische Mails, Produktgruppen, Dienstleistungen, feste Steuerregeln und Liefergebiete. Shop-Rechnungen und private Originale sind ausdrücklich konfigurierbar.

## Mehrkanal-Versand · 1.14.0

Der native Versand ist für Instagram, Facebook-Seiten, Threads, LinkedIn, Pinterest, YouTube und Bluesky enthalten. Alle verwenden die vorhandene dauerhafte Queue, ausdrückliche Inhaltsfreigabe und ein eigens autorisiertes Ziel. TikTok verwendet eine terminierte Inbox-Übergabe über eine beim Anbieter verifizierte HTTPS-Domain; der letzte Veröffentlichungsschritt erfolgt in TikTok. Einrichtung unter **Post-Planer → Kanäle verbinden**. [Prüfbericht und Funktionsmatrix](social-connectors-verification-2026-11-04.md). Ohne eigene Anbieterfreigaben, Konto und Queue wird nichts automatisch gesendet.

Die **Webanalyse** bündelt Besucher, Besuche, Aufrufe, aktive Zeit, Zielseiten und erfasste Geschäftsergebnisse. Zeiträume lassen sich vergleichen und nach Seite, Gerät, Land, Herkunft und Kampagne eingrenzen. Die geschützte Live-Ansicht nutzt die vorhandenen Statistik-Signale der letzten fünf Minuten. Der Consent-Bereich und der dynamische Datenschutzhinweis erläutern diese Auswertung. Bei neuen Starter-Installationen ist die Webanalyse eingeschaltet und misst erst nach ausdrücklicher Statistik-Einwilligung. Unter **Webanalyse → Einrichten** lässt sie sich ausschalten. Gespeicherte Aus-Einstellungen bestehender Projekte bleiben erhalten.

## CMS-Bedienung · 1.46.0

Dieses Update macht die tägliche Arbeit im CMS verlässlicher und übersichtlicher. Inhalte, Datenbankschema und öffentliche Gestaltung bleiben unverändert; es ist keine Migration nötig.

- **Übersicht mit nächstem Schritt.** Die Karte „Website-Stand“ nennt, wie viele gespeicherte Änderungen auf die Veröffentlichung warten und welche Seiten betroffen sind, und öffnet direkt „Prüfen und veröffentlichen“. Darunter sammelt „Zu erledigen“ Bilder ohne Bildbeschreibung, Hinweise des Startchecks und einen fehlenden E-Mail-Versand – jeweils mit Sprung an die richtige Stelle.
- **Veröffentlichung prüfen.** Die Prüfung zeigt fehlende Pflichtangaben vor dem Veröffentlichen, zählt die Änderungen und öffnet den Entwurf als Desktop-, Tablet- oder Smartphone-Vorschau oder eine bestimmte Seite im Editor.
- **Sicher speichern.** Der Speicherstatus zeigt „Ungespeicherte Änderungen“, „Entwurf gespeichert um …“ oder „Nicht gespeichert“. Fehlgeschlagenes Speichern oder Veröffentlichen bietet „Erneut versuchen“, die Eingaben bleiben erhalten.
- **Abgelaufene Sitzung.** Statt zur Anmeldeseite zu wechseln, öffnet sich eine Anmeldung im Fenster. Danach wird das Speichern fortgesetzt; die Änderungen lassen sich vorher auch als Datei sichern.
- **Zwei Tabs oder zwei Personen.** Beim Zurückkehren in einen Tab prüft das CMS einmal die gespeicherte Fassung. Ein Tab ohne eigene Änderungen zeigt dann den neuen Stand, ein Tab mit eigenen Änderungen wird sofort gewarnt. Überschreiben ohne Rückfrage ist weiterhin ausgeschlossen.
- **Lokale Sicherungskopie.** Ungespeicherte Änderungen liegen zusätzlich im Browser. Nach einem Absturz oder versehentlichen Neuladen bietet das CMS sie zum Wiederherstellen an, solange der gespeicherte Entwurf unverändert ist; sonst nur als Datei.
- **Medien.** Format und Größe werden vor dem Hochladen geprüft, mehrere Dateien zeigen „Bild 2 von 5 …“. Nach dem Hochladen öffnet sich die Bildbeschreibung. Der Dialog nennt, wo ein Bild verwendet wird, und sperrt das Löschen verwendeter Bilder. Der Filter „Ohne Bildbeschreibung“ findet fehlende Alt-Texte. Lokal ohne Blob-Store speichert das CMS Bilder in `.data/media`, damit die Mediathek auch in der Testumgebung vollständig funktioniert; der Startcheck meldet solche Bilder vor dem Livegang.
- **Anfragen.** „Per E-Mail antworten“ und „Als erledigt markieren“ direkt in der Anfrage; ein leeres Postfach erklärt, wie Nachrichten ankommen.
- **Suche (Strg/⌘ K).** Findet neben Bereichen auch Seiten und Einstellungen, etwa „SMTP“, „Passwort“ oder „Impressum“.
- **Smartphone und Barrierefreiheit.** Keine Verwaltungsschrift unter 12 px, größere Bedienziele, Einstellungsbereiche als umbrechende Auswahl, mehr Platz für die Vorschau, Hinweise und Speichern-Leisten über der unteren Navigation, kompakter KI-Assistent. Der Sprachschalter erfüllt die Namensregel für Screenreader.
- **Neue Projekte** starten mit einem deutschen CMS. Bestehende Projekte behalten ihre gespeicherte Spracheinstellung.

Beim Übernehmen mit `npm run upgrade:site` sind keine Datenänderungen nötig. Projekte mit eigenen Anpassungen an `admin-app.tsx`, `media-manager.tsx`, `dashboard-help.tsx` oder `cms-saas.css` prüfen die zusammengeführten Stellen. Eigene Admin-Stylesheets mit Schriftgrößen unter 12 px sollten nachgezogen werden. Die neue Route `/api/media/local/…` liefert nur lokal ohne Blob-Store Bilder aus; auf Vercel antwortet sie mit 404.

## Korrekturen · 1.46.1

- **Fehler beim Veröffentlichen im Prüfdialog.** Schlägt „Jetzt veröffentlichen“ fehl, erscheint die Meldung jetzt direkt im Dialog „Veröffentlichung prüfen“ statt als Hinweis dahinter. Bei Verbindungs-, Server- oder Anmeldefehlern heißt der Hauptknopf „Erneut versuchen“, der gespeicherte Entwurf bleibt unverändert. Wurde der Entwurf inzwischen an anderer Stelle geändert, sperrt der Dialog das Veröffentlichen und bietet „Aktuellen Stand laden“ an.
- **Ausgeblendete Abschnitte gut lesbar.** Im Seitenaufbau wird bei ausgeblendeten Abschnitten nur noch das Abschnittssymbol abgeschwächt. Der Name behält den vollen Kontrast (mindestens 4,5:1), dazu kommen ein gestrichelter Rahmen und der Hinweis „Ausgeblendet“.

Keine Daten- oder Schemaänderung. Projekte mit eigenen Anpassungen an `admin-app.tsx` oder `publication-review.tsx` prüfen beim `npm run upgrade:site` die zusammengeführte Fehlerbehandlung von `confirmPublication`; `PublicationReview` nimmt weiterhin einen einfachen Fehlertext an.

## Korrekturen · 1.46.2

- **Kontakt nur per E-Mail möglich.** Bleibt das Feld „Telefon“ in den Einstellungen leer, verschwinden alle Telefon-Links der Website (Kopfzeile, Menü, Hero, Kontaktbereich, Standort, Fußzeile) in allen Layout-Varianten, statt einen leeren `tel:`-Link zu zeigen. Auch `llms.txt` und die strukturierten Daten nennen dann keine Telefonnummer.
- **Kein Rückruf-Feld ohne eigenes Telefon.** Das Kontaktformular fragt die optionale Telefonnummer für einen Rückruf nur noch ab, wenn die Website selbst eine Telefonnummer angibt. Das Feld „Anliegen“ nimmt dann die ganze Zeile ein.

Keine Daten- oder Schemaänderung. Projekte mit eigenen Layout-Varianten prüfen, dass Telefon-Links an `site.phone &&` gebunden sind; `tests/optional-phone.test.ts` prüft das für alle Dateien unter `src/components/site/variants` und dass jedes `ContactForm` der Website `askPhone` aus `site.phone` erhält.

## CMS im Liquid-Glass-Look · 1.47.0

Die Verwaltung ist neu gestaltet: Sie sehen Ihre echte Seite, tippen an, was sich ändern soll, und veröffentlichen mit einem Knopf. Inhalte, Datenbankschema und bestehende Website-Gestaltung bleiben unverändert; es ist keine Migration nötig.

- **Farbe aus Ihrer Marke.** Die Verwaltung übernimmt automatisch die Hauptfarbe Ihrer Website, in hellen und dunklen Varianten mit geprüftem Kontrast. Sehr helle, sehr dunkle oder graue Markenfarben ergeben ein ruhiges Blau.
- **Glas statt Kästen.** Leisten, Bereiche und Dialoge schweben als durchscheinende Flächen über der Seite. Bei „Transparenz reduzieren“ oder „Kontrast erhöhen“ werden sie deckend. Hell, Dunkel oder Automatisch unter **Einstellungen → App & Benachrichtigungen**.
- **Mehr Platz für die Seite.** „Seiten bearbeiten“ und „Design“ öffnen sich im Vollbild; das Menü liegt hinter „Menü“. Oben eine schwebende Leiste mit Seite, Handy/Tablet/Desktop, Speicherstand, Versionen, Rückgängig und „Veröffentlichen“.
- **Antippen, ändern, Fertig.** Ein Tipp auf einen Abschnitt öffnet rechts den Bereich „Bearbeiten“, auf dem Handy als Blatt von unten (größer ziehen, nach unten wischen schließt). „Fertig“ oder Esc schließt ihn. Selten gebrauchte Einstellungen liegen unter „Mehr Gestaltung“.
- **Abschnitt einfügen, wo er hin soll.** Ein „+“ an der Unterkante des gewählten Abschnitts öffnet die Abschnittsgalerie mit Suche und zuletzt verwendeten Bausteinen.
- **Ein Knopf zum Veröffentlichen.** Ungespeicherte Änderungen werden vorher gespeichert. Die Prüfung zeigt „Design geändert: Farben, Schrift“ mit Vorher/Nachher-Miniaturen und für jede Seite eine Miniatur mit den neuen oder geänderten Abschnitten.
- **Neuer Bereich „Design“.** Markenfarbe per Farbrad, Farbcode, Pipette oder aus Logo und Bild; vier Farbvorschläge mit Kontrastprüfung und automatischer Korrektur. Neun geprüfte Schriftkombinationen mit Ihrer echten Überschrift, Schriftgröße „Kompakt · Ausgewogen · Großzügig“. Stil-Kacheln für Design, Ecken, Schaltflächen, Abstände und Bilder. Logo mit Beschreibung, Favicon aus dem Logo. Alles mit Live-Vorschau und Rückgängig.
- **Einführung in 30 Sekunden.** Drei Schritte: antippen, ändern, veröffentlichen. Überspringen jederzeit möglich, wiederholen unter Hilfe.
- **Handy.** Tab-Leiste mit Übersicht, Website, Design, Medien und Mehr; im Editor liegt die Aktionsleiste im Daumenbereich, Bild-Knöpfe sind am gewählten Abschnitt sichtbar.

Beim Übernehmen mit `npm run upgrade:site` sind keine Datenänderungen nötig. Die neuen Felder in `config.theme` sind optional; ohne Auswahl bleibt jede Website wie bisher. Projekte mit eigenen Anpassungen an `admin-app.tsx`, `page-editor.tsx`, `canvas-editor-tools.tsx`, `publication-review.tsx`, `section-inspector-controls.tsx`, `guided-tour.tsx`, `site-view.tsx` oder `validation.ts` prüfen die zusammengeführten Stellen. Eigene Admin-Stylesheets mit festen Farben sollten Tokens wie `var(--cms-surface)` und `var(--cms-ink)` verwenden, damit der dunkle Modus lesbar bleibt. Details und Tokens: [CMS-Gestaltung](cms-design.md).

## Korrekturen · 1.47.1

- **Hilfe: Anleitungen und Tastenkürzel gut lesbar.** Die Anleitungen unter „Hilfe“ sind ruhige Karten mit Innenabstand, Titel in Schriftfarbe und einem Pfeil zum Aufklappen. „Gut zu wissen“ zeigt Tastenkürzel als Tasten neben ihrer Beschreibung. Vorher klebte der Titel am Kartenrand und war im dunklen Modus in Linkfarbe gesetzt.

Nur `src/styles/cms-glass.css`; keine Daten- oder Schemaänderung.

## Korrekturen · 1.47.2

- **KI-Assistent immer unten rechts.** Der Assistent ist ein runder Knopf, fest in der rechten unteren Bildschirmecke (Desktop 24 px Abstand, Handy über der Tab-Leiste, über einer offenen Speicherleiste). Vorher hing er am Ende des scrollenden Seitenbereichs und tauchte je nach Seite mitten im Inhalt auf. Der Bereich öffnet sich aus derselben Ecke; ein Tooltip nennt „KI-Assistent“.

Nur `src/styles/cms-glass.css` und ein `title` in `assistant.tsx`; keine Daten- oder Schemaänderung. Eingebettete, Inline- und Demo-Assistenten behalten ihren Platz.
