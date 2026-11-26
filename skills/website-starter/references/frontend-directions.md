# Eine öffentliche Seite entwerfen

## Vom Auftrag zur sichtbaren Entscheidung

Beginne mit einem Gegenstand und einer Handlung aus dem Briefing. Bei einem Keramikatelier ist der Gegenstand eine Serie von Gefäßen. Wer sie einkaufen möchte, braucht zunächst Form und Maßstab, danach Varianten und Material. Bei einem Musikabend sind Datum, Beginn und Ort früher wichtig als ein Absatz über den Veranstalter. Diese Reihenfolge bestimmt, was auf den ersten Bildschirm gehört.

Skizziere bei einem offenen Gestaltungsauftrag zwei plausible erste Bildschirme mit demselben **echten** Titel, Motiv und Linkziel. Ein Entwurf darf etwa mit einem Anschnitt beginnen, der andere mit einem bedienbaren Verzeichnis. Halte in `project/brief.json` unter `style` in wenigen Sätzen fest, welchen Weg du ausarbeitest, woran Besucher die Marke erkennen und wie sie zur ersten Aufgabe gelangen. Bei festgelegter Markenrichtung arbeite direkt in dieser Richtung. Bei einer neuen Unterseite übernimm Navigation, Schriftrollen und Bedienmuster der vorhandenen Website und entwirf den Einstieg aus ihrer eigenen Aufgabe.

## Was an den fünf Kundenreferenzen trägt

Die Referenzen helfen bei einer konkreten Gestaltungsfrage. Öffne für ein neues Projekt die passende Seite, betrachte ihren ersten und zweiten Bildschirm und verfolge eine Handlung. Die folgenden Beobachtungen stammen aus den öffentlichen Auftritten im November 2026.

| Referenz | Beobachtung | Auf einen anderen Auftrag übertragen |
| --- | --- | --- |
| [Praxis Dr. Pfaller](https://dr-pfaller.vercel.app/) | Die Praxis zeigt zuerst eine Beratungssituation auf Augenhöhe. Die blaue Terminaktion bleibt neben der ruhigen Aufnahme gut auffindbar. | Für eine erklärungsbedürftige Dienstleistung den Moment fotografieren, in dem eine Person die Entscheidung versteht. Bildausschnitt und nächste Frage gemeinsam entwerfen. |
| [Sebastian Maschberger](https://sebmaschberger-coaching.vercel.app/) | Das Porträt im tatsächlichen Trainingsumfeld gibt der persönlichen Ansprache ein Gesicht. Im Wochenplan wird die Methode an einer konkreten Woche verständlich. | Bei einer Personenmarke ein eigenes Porträt führen lassen. Einen Teil der Arbeitsweise mit echten Eingaben oder einer nachvollziehbaren Auswahl erlebbar machen. |
| [Kantiq](https://kantiq.de/) | Das räumliche K trägt die Identität bereits im ersten Bildschirm. Der weitere Weg verzweigt zu Websites, Tools und Beratung. | Ein markeneigenes Objekt mit eigenem Licht und eigener Silhouette entwickeln. Seine Bewegung soll etwas über die Marke oder das Produkt zeigen. |
| [Kantiq Creators](https://creators.kantiq.de/) | Das geneigte Smartphone zeigt an seinem Display, was ein Creator veröffentlicht. Verdichtete Schrift und Signalton geben der Bewegung einen Rahmen. | Das Produkt mit lesbarem Inhalt und in einer typischen Nutzungssituation inszenieren. Die nächste Ansicht darf vom Überblick zu einem konkreten Detail springen. |
| [Kantiq Clubs](https://clubs.kantiq.de/) | Ein Spieler im Flutlicht eröffnet die Seite. Die anschließenden Vereinsbeispiele machen Abläufe verschiedener Sportarten greifbar. | Einen erkennbaren Augenblick aus der Welt der Zielgruppe wählen. Die Bildidee zu einer passenden Aufgabe weiterführen, etwa zur Aufstellung oder zur nächsten Begegnung. |

Verwende für Kundenprojekte eigene oder freigegebene Motive, Schriften und Markenbestandteile. Der Name einer Referenz im Briefing beschreibt ein Qualitätsniveau. Halte im Brief fest, welche einzelne Entscheidung du übernimmst und welche eigenständige Lösung das neue Projekt bekommt.

## Den Entwurf am Material prüfen

1. **Erster Bildschirm.** Wähle ein Foto, Objekt, Druckmotiv oder eine Illustration, die sich aus dem Auftrag herleiten lässt. Plane Anschnitt, Licht, Blickrichtung, Zeilenfall und Hauptaktion gemeinsam. Öffne die Skizze auch ohne Bewegung. Das Motiv und die Handlung müssen unmittelbar erkennbar sein.
2. **Zweiter Bildschirm.** Beantworte die erste Frage, die das Motiv auslöst. Wechsel den Maßstab oder das Darstellungsprinzip: vom Gefäß zur Glasur, vom Plakat zur Running Order, vom Bergkamm zum Höhenprofil. Eine Reihe austauschbarer Leistungskarten genügt dafür selten.
3. **Interaktion.** Arbeite eine projekttypische Handlung vollständig aus. Prüfe, was nach Auswahl, Tastendruck und Rückkehr sichtbar ist. Bei einer ruhigen Praxiswebsite kann schon die direkte Wahl eines Beratungsanliegens der passende Höhepunkt sein.
4. **Gegenprobe.** Vergleiche beide Bildschirmhöhen und die Zielseite mit der Referenz auf Desktop und Smartphone. Blende das Logo kurz aus. Lassen Motiv, Wortwahl, Form der Navigation und Übergang immer noch auf diesen Auftrag schließen? Falls nur Farbe und Überschrift die Marke tragen, ändere Komposition oder Material und nimm erneut auf.

## Drei ausführbare Referenzen

Im **neutralen Starter** erzeugt jeder dieser Aufrufe eine eigenständige Website mit CMS, Beispieldaten und lokaler Gestaltung. Die Galerie enthält Browseraufnahmen und die drei Quellverzeichnisse. [Galerie im Starter](https://github.com/bthginfo/website-starter/tree/main/examples/frontends)

| Beispiel | Was du daran untersuchen kannst | Aufruf |
| --- | --- | --- |
| TONWERK · Materialstudio | Verhältnis von Objekt, Typografie und Leerraum. Übergang vom Betrachten einer Serie zum genauen Materialdetail. | `node scripts/create-site.mjs --example material-studio --out ../tonwerk` |
| NACHTFUNK · Musikprogramm | Ein Plakat macht neugierig. Der Spielplan lässt sich nach Beginn überfliegen. Das gewählte Programm führt auf eine Detailseite. | `node scripts/create-site.mjs --example night-programme --out ../nachtfunk` |
| GRATLINIE · Feldjournal | Ein weites Bild vermittelt den Ort. Beim Wechsel zur einzelnen Etappe rücken Wegpunkt und Lesetext nach vorn. | `node scripts/create-site.mjs --example field-notes --out ../gratlinie` |

Starte das erzeugte Projekt mit `npm ci` und `npm run dev`. Die drei Quellen liegen unter `examples/frontends/<name>/` im neutralen Repository. Vergleiche `brief.json`, die Abschnittsfolge in `compose.mjs`, die Interaktion in `hero-art.tsx` und `style.css`. Im erzeugten Projekt liegt die optionale Interaktion unter `src/components/site/project-hero-art.tsx`. Beziehe ihre Inhalte aus dem bearbeiteten Abschnitt oder den sichtbaren Abschnitten derselben Seite. Prüfe nach dem Tausch eines Bildes oder dem Ausblenden eines Eintrags erneut. Im erzeugten Projekt liegen die gestaltbaren Inhalte im CMS und die projektspezifischen Regeln in `src/styles/project.css`. Ein Projekt ohne Beispiel beginnt weiterhin mit dem gewählten Profil.

Übertrage auf einen Kundenauftrag eine **begründete Entscheidung** aus einer Referenz. Eine Praxis könnte etwa die zeitliche Lesbarkeit des Spielplans für ihre Sprechzeiten übernehmen, während Fotografie, Tonalität und Buchungsweg aus der Praxis kommen. Ersetze fiktive Namen, Termine, Leistungen und Medien vor einer Kundenfreigabe. Für eigene Entwürfe kannst du die Referenzen einzeln betrachten und das Kundenprojekt mit dem passenden Profil beginnen.

## Komposition für Desktop und Mobilgerät

- **Typografie.** Setze Headline und Hauptaktion zuerst mit den längsten freigegebenen Wörtern. Wähle Schrift, Breite und Zeilenfall zusammen. Eine lange deutsche Bezeichnung muss auch bei vergrößerter Schrift vollständig lesbar bleiben. Preise, Termine und vergleichbare Werte bekommen eine klare gemeinsame Achse.
- **Bildregie.** Bestimme den Bildausschnitt pro Gerät. Das Motiv braucht einen erkennbaren Maßstab und der Text einen stabilen Kontrasthintergrund. Lege Platz für Bilder und Videoposter vor dem Laden fest. Bei fehlendem Material muss der Text mit seiner Hauptaktion eigenständig funktionieren.
- **Rhythmus.** Lass die nächste Sektion die erste offene Frage beantworten. Auf eine große Objektaufnahme kann ein Verzeichnis folgen, auf ein Veranstaltungsplakat ein Zeitplan, auf eine Landschaft ein Etappenblatt. Wähle für die Detailseite eine eigene Lesereihenfolge mit einem Rückweg zur Übersicht. Prüfe, ob der Austausch von Logo und Akzentfarbe allein den Entwurf bereits für ein beliebiges anderes Unternehmen passend machen würde. In diesem Fall arbeite Motiv, Inhalt oder Aufbau weiter aus.

## Bewegung als Bedienhilfe

Gib jeder zentralen Handlung sichtbare Rückmeldung. Das bewegte Element sollte zeigen, **was** sich ändert. Die folgenden Zeiten sind Ausgangspunkte für die Vorschau.

| Handlung | Unmittelbares Feedback | Touch, Tastatur und reduzierte Bewegung |
| --- | --- | --- |
| Detail öffnen | Ein Richtungspfeil bewegt sich bei Hover oder Fokus etwa 2–4 px in Leserichtung. Beim Drücken bleibt die Trefferfläche stehen. Etwa 120–180 ms genügen. | Eindeutige Beschriftung und Fokusrahmen tragen die Aktion auch bei ruhendem Pfeil. |
| Bild, Serie oder Etappe wählen | Das neue Motiv erscheint mit einer kurzen Überblendung. Beschriftung und gewählter Zustand wechseln sofort. Eine weitere Auswahl darf den Übergang unterbrechen. | Beschriftete Tasten oder Links zusätzlich zu Wischgesten anbieten. Ohne Bewegung direkt auf das Zielbild wechseln. |
| Termine oder Details öffnen | Inhalt direkt unter der gewählten Zeile zeigen. Ein kleines Icon verdeutlicht offen und geschlossen. | Native `details/summary` oder ein beschrifteter Button mit korrektem `aria-expanded`. Das Öffnen muss mit der Tastatur funktionieren. [WAI Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) |
| Anfrage senden | Druckzustand, laufender Versand, bestätigte Antwort und erneuter Versuch sind unterscheidbar. Das Sendesymbol darf abheben. Der Erfolgshaken gehört zur bestätigten Serverantwort. | Während des Versands Doppelklick abfangen. Fehlertext und erhaltene Eingabe machen einen erneuten Versuch möglich. Das bestehende `ContactForm` bringt diese Zustände mit. |

Bewegung soll natürliche Navigation unterstützen. Erhalte Scrolltempo, Sprungmarken, Zurückfunktion und Fokus. Ein erster Bildschirm, der auf eine Einblendung warten muss, ist noch nicht fertig. `prefers-reduced-motion` behält Inhalt, Auswahl, Status und Bedienbarkeit. [Apple Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

## Abnahme an einer echten Aufgabe

Öffne die generierte Startseite und gehe bis zum ersten sinnvollen Ergebnis. Zeige etwa das gewählte Werk, den geöffneten Abend oder die richtige Etappe. Wiederhole den Weg auf einem schmalen Gerät, per Tastatur und mit reduzierter Bewegung. Prüfe den ersten Bildschirm auch mit offener Einwilligung, lange Titel bei 200 % Zoom, Bildbeschnitt und Fokus nach der Rückkehr. Kontrolliere im CMS an einem echten Abschnitt, dass Text-, Bild- und Linkänderungen den öffentlichen Renderer erreichen.

Lege Desktop- und Mobilansicht nebeneinander. Halte einen beobachteten Korrekturpunkt oder den erfolgreich durchlaufenen Bedienweg fest. Prüfe bei schweren Bildern oder Animationen Ladezeit des Hauptmotivs, Reaktion auf Eingabe und Layoutverschiebungen. Unterscheide lokale Beobachtungen von Messwerten tatsächlicher Besucher. [Web Vitals](https://web.dev/articles/vitals)
