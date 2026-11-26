# co:mondi

Eigenständiger Relaunch der comondi GmbH auf Grundlage von `bthginfo/website-starter` 1.36.0 (Commit `17b8eb900910338c05192a7fc38d8814f216c2b8`). Next.js 16.4, React 19, TypeScript, Node 24 und Three.js.

Die 15 redaktionellen Seiten verbinden einen dunklen Liquid-Glass-Auftritt mit einer echten Three.js-Szene, interaktiven Leistungswelten und dem sechsstufigen Road2Goat-Prozess. Eigene Unterseiten behandeln Projektmanagement, agile Transformation, hybride Zusammenarbeit und KI im Arbeitsalltag. Bestehende Beiträge und geprüfte Anbieterangaben stammen aus comondi.de.

Der Quellstand stammt aus dem Produktionsdeployment vom 23. November 2026. Die laufende Website ist unter der Vercel-Adresse erreichbar. [co:mondi](https://comondi.vercel.app)

## Lokal

```sh
npm ci
node scripts/configure-auth.mjs --generate
npm run dev
```

Der lokale Erstzugang liegt ausschließlich in der ignorierten Datei `.data/admin-access.json`. Entwicklung und Tests verwenden `.data/`. Remote-Datenbanken werden lokal nur mit ausdrücklichem `WS_USE_REMOTE_DATABASE=1` genutzt.

## Redaktion

`/admin` öffnet das visuelle CMS. Alle co:mondi-Abschnitte sind in der Bibliothek unter **co:mondi** erfasst. Texte, Einträge, Links, Reihenfolgen, Sichtbarkeit und Abschnittsgestaltung bleiben redaktionell bearbeitbar. Entwürfe und veröffentlichte Inhalte sind getrennt. `src/data/content.json` wird nur beim Erstimport verwendet.

Die öffentliche Website und die Vorschau verwenden dieselben Komponenten. Three.js lädt automatisch, sobald sich die Szene dem sichtbaren Bereich nähert. Auf Smartphones lässt sich der Planet mit einer horizontalen Wischgeste wechseln. Die Website berücksichtigt die Systemeinstellung für reduzierte Bewegung und bietet eine Einstellung zum Pausieren der Animationen.

## Infrastruktur und Veröffentlichung

`project/infrastructure.json` dokumentiert das Vercel-Projekt und die zugehörigen Speicherressourcen. Die veröffentlichten CMS-Inhalte und Entwürfe liegen in Neon, die hochgeladenen Medien in Vercel Blob. Zugangsdaten werden in den Umgebungsvariablen des Vercel-Projekts verwaltet.

Für eine neue, leere Datenbank läuft der Erstimport einmalig über `npm run db:setup`. Der Build verwendet den bereits veröffentlichten Stand. Kontaktanfragen erscheinen im CMS-Postfach.

Das Vercel-Deployment läuft im Review-Modus mit `noindex`. Alte HTML-Adressen leiten auf die passenden neuen Seiten weiter.

## Prüfung

```sh
npm run typecheck
npm test
npm run build
npm run verify:local -- http://localhost:3000
```

Zwei Generator-Tests werden in Kundeninstallationen ausgelassen: Sie dürfen ausschließlich gegen das neutrale Template ausgeführt werden. Der Schutz vor einer Generierung aus Kundenprojekten bleibt erhalten. Der wöchentliche Dependency-Sicherheitsworkflow und die Sicherheitsübersicht des Starters sind enthalten.

## Medien

Planetentexturen: Solar System Scope, CC BY 4.0, https://www.solarsystemscope.com/textures/. Die lokal bereitgestellten Texturen wurden in WebP umgewandelt. Das Comondi-Logo und die redaktionellen Ausgangsinhalte stammen aus der bestehenden Unternehmenswebsite. Keine erfundenen Kundenlogos, Erfolgszahlen oder Teamfotos.
