import { createAssistantShowcaseContent } from './assistant/showcase';
import { createPostPlannerItem } from './creator/tools';
import { createScrollStoryContent } from './creator/story';
import { createLensContent, createOrbitContent } from './creator/scenes';
import { createRemixContent } from './creator/remix';
import { createEngagementContent } from './creator/engagement';
import { createJourneyContent } from './creator/journey';
import { motionStoryStudioPoster } from './motion-story';
import { createStarterVisualContent } from './starter-visuals.mjs';
import { ContentItem, Section, SectionContent, SectionDesign, SectionType, SiteConfig } from './types';
import { comondiPageSectionTypes } from './comondi-sections';

export const sectionLibrary: {type:SectionType;name:string;description:string;category:string;icon:string}[] = [
  {type:'comondi-hero',name:'co:mondi · Planeten-Auftakt',description:'Einstieg mit Three.js-Planeten, bearbeitbaren Texten und Glasflächen.',category:'co:mondi',icon:'Orbit'},
  {type:'comondi-proof',name:'co:mondi · Kompetenzen',description:'Echte Qualifikationen ohne erfundene Referenzen.',category:'co:mondi',icon:'BadgeCheck'},
  {type:'comondi-intro',name:'co:mondi · Einordnung',description:'Angebot und Prinzipien.',category:'co:mondi',icon:'Layers'},
  {type:'comondi-worlds',name:'co:mondi · Leistungswelten',description:'Vier bedienbare Themen mit eigenen Texten und Links.',category:'co:mondi',icon:'Globe'},
  {type:'comondi-process',name:'co:mondi · Road2Goat',description:'Interaktiver Weg mit sechs Schritten.',category:'co:mondi',icon:'Route'},
  {type:'comondi-culture',name:'co:mondi · Unsere Haltung',description:'Werte und Zusammenarbeit.',category:'co:mondi',icon:'Heart'},
  {type:'comondi-cta',name:'co:mondi · Kontaktaufruf',description:'Glasfläche mit Kontaktaktion.',category:'co:mondi',icon:'Mail'},
  {type:'comondi-inner',name:'co:mondi · Unterseiten-Auftakt',description:'Überschrift und Einleitung.',category:'co:mondi',icon:'Type'},
  {type:'comondi-team',name:'co:mondi · Ansprechpartner',description:'Echte Kontakte mit bearbeitbaren Bildern.',category:'co:mondi',icon:'Users'},
  {type:'comondi-contact',name:'co:mondi · Kontakt',description:'Anfrageformular und Kontaktdaten.',category:'co:mondi',icon:'Mail'},
  {type:'comondi-faq',name:'co:mondi · Fragen',description:'Aufklappbare Antworten.',category:'co:mondi',icon:'CircleHelp'},
  {type:'comondi-articles',name:'co:mondi · Perspektiven',description:'Bearbeitbare Beiträge mit Links.',category:'co:mondi',icon:'BookOpen'},
  {type:'comondi-legal',name:'co:mondi · Rechtliches und Artikel',description:'Gliederbare Texte mit Links.',category:'co:mondi',icon:'FileText'},
  {type:'comondi-map',name:'co:mondi · Landkarte der Welten',description:'Alle Leistungswelten mit Teilleistungen auf einer Karte.',category:'co:mondi',icon:'Map'},
  {type:'comondi-pairs',name:'co:mondi · Kombinationen',description:'Zwei Welten, die sich bei einer Frage verbinden.',category:'co:mondi',icon:'Combine'},
  {type:'comondi-formats',name:'co:mondi · Formen der Begleitung',description:'Begleitformen als Umlaufbahnen um euer Team.',category:'co:mondi',icon:'Orbit'},
  {type:'comondi-planet-hero',name:'co:mondi · Planeten-Einstieg',description:'Einstieg einer Leistungsseite mit eigenem Planeten.',category:'co:mondi',icon:'Globe2'},
  {type:'comondi-questions',name:'co:mondi · Ausgangslage & Einstieg',description:'Fragen zum Markieren und ein klarer erster Schritt.',category:'co:mondi',icon:'ListChecks'},
  {type:'comondi-service-work',name:'co:mondi · Leistungsbild',description:'Was co:mondi tut, als Strukturplan, Kreislauf, Brücke oder Phasen.',category:'co:mondi',icon:'Workflow'},
  {type:'comondi-related',name:'co:mondi · Weiterlesen',description:'Passende Beiträge aus den Perspektiven.',category:'co:mondi',icon:'BookOpen'},
  {type:'comondi-next',name:'co:mondi · Nächster Schritt',description:'Kontaktaufruf mit Ansprechpersonen.',category:'co:mondi',icon:'Send'},
  {type:'comondi-route',name:'co:mondi · Road2Goat-Route',description:'Der gemeinsame Weg als ausführliche Route.',category:'co:mondi',icon:'Route'},
  {type:'comondi-terms',name:'co:mondi · Erwartungen & Tempo',description:'Was beide Seiten einbringen, dazu das Tempo.',category:'co:mondi',icon:'Handshake'},
  {type:'comondi-portraits',name:'co:mondi · Porträts',description:'Menschen hinter co:mondi mit Porträt und Kontakt.',category:'co:mondi',icon:'UserRound'},
  {type:'comondi-values',name:'co:mondi · Haltung',description:'Leitworte der Zusammenarbeit.',category:'co:mondi',icon:'Heart'},
  {type:'comondi-constellation',name:'co:mondi · Kompetenz-Sternbild',description:'Kompetenzen im Team als Sternbild.',category:'co:mondi',icon:'Sparkles'},
  {type:'comondi-places',name:'co:mondi · Standorte',description:'Orte auf einer gezeichneten Karte.',category:'co:mondi',icon:'MapPin'},
  {type:'comondi-magazine',name:'co:mondi · Magazin',description:'Beitragsübersicht mit Leitbeitrag und Themenfilter.',category:'co:mondi',icon:'Newspaper'},
  {type:'comondi-article',name:'co:mondi · Beitrag',description:'Leselayout mit Fortschritt und Inhaltsverzeichnis.',category:'co:mondi',icon:'FileText'},
  {type:'comondi-after',name:'co:mondi · Nach dem Absenden',description:'Was nach einer Anfrage passiert.',category:'co:mondi',icon:'MailCheck'},
  {type:'newsletter-signup',name:'Newsletter-Anmeldung',description:'Anmeldeformular mit Einwilligung und Bestätigungs-E-Mail. Optional für eine bestimmte Empfängergruppe.',category:'Kontakt',icon:'Mail'},
  {type:'newsletter-showcase',name:'Newsletter und Webanalyse · Vorschau',description:'Bedienbares Beispiel mit fiktiven Ausgaben, Empfängergruppen und Besucherzahlen.',category:'Service',icon:'LayoutDashboard'},
  {type:'assistant-showcase',name:'KI-Assistent · eigenständiges Beispiel',description:'Optionale CMS-Hilfe für Texte, Seiten, Social-Posts und Content-Ideen mit lokal prüfbaren Vorschlägen.',category:'Service',icon:'MessageSquareText'},
  {type:'creator-journey',name:'Creator · Content-Wege',description:'Drei nachvollziehbare Wege vom Content zur eigenen Website und zur nächsten Aktion.',category:'Creator',icon:'Route'},
  {type:'creator-engagement',name:'Creator · Engagement',description:'Aus einem scharfen Website-Ausschnitt in eine echte Geräteansicht herauszoomen. Mit lokal bedienbarem Herz.',category:'Creator',icon:'Heart'},
  {type:'creator-scroll-story',name:'Creator · Fotogeschichte',description:'Drei eigene Bildmomente mit nativer Scroll-Choreografie.',category:'Creator',icon:'Images'},
  {type:'creator-lens',name:'Creator · Perspektivwechsel',description:'Ein Bildportal per Maus, Touch und Tastatur erkunden.',category:'Creator',icon:'ScanEye'},
  {type:'creator-orbit',name:'Creator · Content-Orbit',description:'Eigene Inhalte auswählen und sichtbar zu einer Website zusammenbringen.',category:'Creator',icon:'Orbit'},
  {type:'creator-remix',name:'Creator · Website-Remix',description:'Vier Module live kombinieren und die eigene Auswahl in eine Kontaktanfrage übernehmen.',category:'Creator',icon:'SlidersHorizontal'},
  {type:'creator-demo',name:'Creator-Browser',description:'Eine echte lokale Beispielwebsite mit Navigation, Vollbild und gemeinsamem Demo-CMS.',category:'Creator',icon:'Monitor'},
  {type:'creator-hero',name:'Creator · Auftakt',description:'Eigener Creator-Auftritt mit zehn gestaltbaren Kompositionen.',category:'Creator',icon:'PanelTop'},
  {type:'creator-social',name:'Creator · Plattformen',description:'Eigene Medien und klar gekennzeichnete Plattformbeispiele.',category:'Creator',icon:'Video'},
  {type:'creator-shop',name:'Creator · Shop',description:'Physische und digitale Produkte aus dem aktivierten Shop-Modul.',category:'Creator',icon:'ShoppingBag'},
  {type:'creator-tools',name:'Creator · Werkzeuge',description:'Interaktive, lokal ausprobierbare Arbeitsabläufe.',category:'Creator',icon:'Wrench'},
  {type:'creator-hero-stack',name:'Creator · Designgalerie',description:'Zehn unterschiedliche responsive Einstiege durchblättern.',category:'Creator',icon:'Layers'},
  {type:'creator-media-kit',name:'Creator · Media-Kit',description:'Eigene Leistungen und belegte oder als Beispiel markierte Angaben.',category:'Creator',icon:'FileText'},
  {type:'creator-links',name:'Creator · Links',description:'Redaktionell gepflegte weiterführende Links.',category:'Creator',icon:'Link'},

  {type:'hero',name:'Großer Auftakt',description:'Prägnante Überschrift, großes Bild und direkter Kontakt.',category:'Einstieg',icon:'PanelTop'},
  {type:'showcase-hero',name:'Bildbühne',description:'Große Typografie und ein sanfter Bildauftritt. Wählbar als Panorama, nebeneinander oder mit Porträtfokus.',category:'Einstieg',icon:'PanelTop'},
  {type:'scroll-story',name:'Fotogeschichte',description:'Ein Bild bleibt beim Lesen stehen und wechselt mit dem Kapitel. Auf kleinen Bildschirmen stehen Bild und Text zusammen.',category:'Bilder',icon:'Images'},
  {type:'scene-sequence',name:'Szenenwechsel beim Scrollen',description:'Große Bildszenen schieben sich beim Scrollen seitlich aus der Bühne. Auf kleinen Bildschirmen stehen die Szenen untereinander.',category:'Cinematic',icon:'Layers'},
  {type:'workflow-demo',name:'Animierter Ablauf',description:'Einen Prozess Schritt für Schritt zeigen. Besucher können pausieren, weiterschalten und direkt zu einem Schritt springen.',category:'Service',icon:'Route'},
  {type:'project-stage',name:'Projektgalerie',description:'Arbeiten, Angebote oder Themen mit großem Motiv, Beschreibung und Links durchblättern.',category:'Bilder',icon:'Layers'},
  {type:'affiliate-links',name:'Partner und Affiliate-Links',description:'Empfehlungen, Beispiele und gekennzeichnete Werbung mit eigenen Links.',category:'Inhalte',icon:'Handshake'},
  {type:'project-index',name:'Filterbare Projektübersicht',description:'Ein Projekt groß vorstellen und weitere Arbeiten nach Kategorien filtern.',category:'Bilder',icon:'LayoutGrid'},
  {type:'editorial-index',name:'Themenverzeichnis',description:'Angebote und Themen als redaktionelle Liste mit Beschreibungen, kleinen Bildern und Links.',category:'Inhalte',icon:'ListChecks'},
  {type:'statement',name:'Große Aussage',description:'Eine wichtige Aussage mit Raum und klarer Typografie.',category:'Text',icon:'Type'},
  {type:'services',name:'Leistungen',description:'Aufklappbare Themen mit Beschreibung und weiterführendem Link.',category:'Inhalte',icon:'Scale'},
  {type:'team',name:'Menschen & Team',description:'Porträts mit Namen, Qualifikationen und Kontakt.',category:'Inhalte',icon:'Users'},
  {type:'split',name:'Bild und Text',description:'Ein Foto neben einem ausführlicheren Text.',category:'Bilder',icon:'Columns2'},
  {type:'contact',name:'Kontaktformular',description:'Nachricht senden, Telefonnummer, Anschrift und Bürozeiten.',category:'Kontakt',icon:'Mail'},
  {type:'restaurant-menu',name:'Speisen & Getränke',description:'Zentrale Karte als Liste, Vorschau oder Auswahl einfügen.',category:'Gastronomie',icon:'list'},
  {type:'reservation',name:'Tischreservierung',description:'Tischanfragen mit verfügbaren Zeiten und Personenanzahl entgegennehmen.',category:'Gastronomie',icon:'calendar'},
  {type:'faq',name:'Häufige Fragen',description:'Antworten, die sich mit einem Klick öffnen lassen.',category:'Service',icon:'CircleHelp'},
  {type:'steps',name:'Ablauf',description:'Einen Vorgang in verständliche Schritte aufteilen.',category:'Service',icon:'Route'},
  {type:'stats',name:'Kennzahlen',description:'Belegte Zahlen mit kurzer Erklärung zeigen.',category:'Inhalte',icon:'ChartNoAxesColumn'},
  {type:'gallery',name:'Bildergalerie',description:'Mehrere Bilder als großzügige Bilderstrecke.',category:'Bilder',icon:'Images'},
  {type:'richtext',name:'Fließtext',description:'Überschrift und längere Texte mit Absätzen.',category:'Text',icon:'AlignLeft'},
  {type:'cta',name:'Kontaktaufruf',description:'Eine klare Einladung mit einer oder zwei Schaltflächen.',category:'Kontakt',icon:'MousePointer2'},
  {type:'cards',name:'Themenkarten',description:'Verlinkte Themen mit optionalem Bild und Symbol.',category:'Inhalte',icon:'LayoutGrid'},
  {type:'list',name:'Liste & Checkliste',description:'Wichtige Punkte klar untereinander darstellen.',category:'Text',icon:'ListChecks'},
  {type:'downloads',name:'Formulare & Downloads',description:'PDF-Dokumente mit verständlicher Beschreibung verlinken.',category:'Service',icon:'Download'},
  {type:'quote',name:'Zitat',description:'Eine belegte Aussage mit namentlicher Zuordnung.',category:'Text',icon:'Quote'},
  {type:'logos',name:'Logo-Leiste',description:'Eigene oder freigegebene Logos mit Alt-Text zeigen.',category:'Bilder',icon:'BadgeCheck'},
  {type:'video',name:'Video',description:'Ein selbst gehostetes Video mit Vorschaubild und Beschreibung.',category:'Bilder',icon:'Video'},
  {type:'map',name:'Anfahrt',description:'Interaktive Google-Karte nach Einwilligung, Anschrift und Routenplanung.',category:'Kontakt',icon:'MapPin'},
  {type:'divider',name:'Trennfläche',description:'Inhalte durch eine ruhige, gestaltbare Fläche gliedern.',category:'Layout',icon:'Minus'},
  {type:'timeline',name:'Zeitlicher Verlauf',description:'Stationen chronologisch mit Datum und Text darstellen.',category:'Inhalte',icon:'History'},
  {type:'accordion',name:'Aufklappbare Inhalte',description:'Umfangreiche Informationen platzsparend gliedern.',category:'Text',icon:'ListCollapse'},
  {type:'notice',name:'Hinweis',description:'Eine wichtige Information klar hervorheben.',category:'Service',icon:'Info'},
  {type:'announcement',name:'Ankündigung',description:'Urlaub, neue Öffnungszeiten oder einen wichtigen Termin direkt auf der Website ankündigen.',category:'Service',icon:'calendar'},
  {type:'comparison',name:'Gegenüberstellung',description:'Zwei bis vier Möglichkeiten übersichtlich vergleichen.',category:'Inhalte',icon:'GitCompareArrows'},
  {type:'columns',name:'Textspalten',description:'Zusammengehörende Texte in mehreren Spalten anordnen.',category:'Layout',icon:'Columns3'},
  {type:'opening-hours',name:'Bürozeiten',description:'Erreichbarkeit und Hinweise zu Terminen darstellen.',category:'Kontakt',icon:'clock'},
  {type:'editorial-hero',name:'Editorial · Bildcollage',description:'Große Serifentypografie mit versetzten Foto- und Porträtflächen.',category:'Editorial',icon:'image'},
  {type:'portrait-mosaic',name:'Editorial · Porträtmosaik',description:'Menschen in einer abwechslungsreichen, asymmetrischen Anordnung.',category:'Editorial',icon:'users'},
  {type:'service-explorer',name:'Editorial · Themenfinder',description:'Leistungen auswählen und passende Informationen aufdecken.',category:'Editorial',icon:'list'},
  {type:'editorial-statement',name:'Editorial · Große Aussage',description:'Eine präzise Aussage als grafisch gesetzte Textfläche.',category:'Editorial',icon:'type'},
  {type:'contact-poster',name:'Editorial · Kontaktplakat',description:'Ein großformatiger Kontaktaufruf mit deutlicher Schaltfläche.',category:'Editorial',icon:'mail'},
  {type:'editorial-gallery',name:'Editorial · Bilderstrecke',description:'Große Einzelbilder mit vor- und zurückschaltbarer Navigation.',category:'Editorial',icon:'image'},
  {type:'cinematic-hero',name:'Cinematic · Bildauftakt',description:'Ein raumfüllendes Bild mit markanter, schmaler Typografie.',category:'Cinematic',icon:'image'},
  {type:'motion-story',name:'Animierter Hero',description:'Eine 3D-Szene mit eigener Kamerafahrt. Spielt beim Scrollen oder als Schleife.',category:'Cinematic',icon:'video'},
  {type:'scroll-3d',name:'Interaktive 3D-Scroll-Story',description:'Ein 3D-Objekt verändert sich beim Scrollen. Mit eigenen Kapiteln, Farben und Kamerabewegung.',category:'Cinematic',icon:'video'},
  {type:'focus-finder',name:'Cinematic · Anliegenfinder',description:'Eine interaktive Auswahl für tatsächliche Leistungen.',category:'Cinematic',icon:'list'},
  {type:'portrait-rail',name:'Cinematic · Porträtstrecke',description:'Große Porträts mit manueller und per Tastatur bedienbarer Navigation.',category:'Cinematic',icon:'users'},
  {type:'stacked-panels',name:'Cinematic · Schrittkarten',description:'Ein Ablauf als gestaffelte, beim Scrollen aufeinanderfolgende Flächen.',category:'Cinematic',icon:'layers'},
  {type:'kinetic-statement',name:'Cinematic · Typografiefläche',description:'Eine große Aussage mit dezenter Bewegung und ruhiger Alternative.',category:'Cinematic',icon:'type'},
  {type:'contact-dock',name:'Cinematic · Kontaktfläche',description:'Ein kontrastreicher Abschluss mit direktem Kontakt.',category:'Cinematic',icon:'phone'},
  {type:'blog-cards',name:'Blog · Bildkarten',description:'Veröffentlichte Beiträge als bebilderte Karten zeigen.',category:'Blog',icon:'image'},
  {type:'blog-editorial',name:'Blog · Redaktionelle Übersicht',description:'Einen Leitbeitrag mit einer versetzten Beitragsübersicht verbinden.',category:'Blog',icon:'columns'},
  {type:'blog-list',name:'Blog · Kompakte Liste',description:'Beiträge mit Titel, Datum und kurzer Zusammenfassung auflisten.',category:'Blog',icon:'list'},
  {type:'noir-hero',name:'Noir · Räumlicher Auftakt',description:'Dunkle Tiefenebenen, große Typografie und frei stehende Fotofenster.',category:'Noir',icon:'layers'},
  {type:'case-deck',name:'Noir · Themenkarten',description:'Leistungen als horizontal bedienbare Karten mit Bild und Text.',category:'Noir',icon:'columns'},
  {type:'people-index',name:'Noir · Personenindex',description:'Namen und Porträts in einer interaktiven Übersicht verbinden.',category:'Noir',icon:'users'},
  {type:'image-curtain',name:'Noir · Bildvorhang',description:'Zwei Unternehmensbilder über einen bedienbaren Schieber entdecken.',category:'Noir',icon:'image'},
  {type:'noir-manifesto',name:'Noir · Großes Statement',description:'Eine prägnante Aussage vor einer zurückgesetzten Bildebene.',category:'Noir',icon:'type'},
  {type:'noir-contact',name:'Noir · Kontaktabschluss',description:'Direkter Kontakt auf einer großzügigen dunklen Fläche.',category:'Noir',icon:'phone'},
  {type:'navy-hero',name:'Navy · Modularer Auftakt',description:'Klarer Einstieg mit dunkler Bild- und Themenkomposition.',category:'Navy',icon:'layers'},
  {type:'navy-bento',name:'Navy · Bento-Felder',description:'Inhalte als unterschiedlich große, bearbeitbare Flächen anordnen.',category:'Navy',icon:'square'},
  {type:'navy-service-tabs',name:'Navy · Themenauswahl',description:'Zwischen Leistungen wechseln und passende Informationen zeigen.',category:'Navy',icon:'list'},
  {type:'navy-people',name:'Navy · Ansprechpartner',description:'Porträts und Kontaktdaten in einer kompakten, bildbetonten Übersicht.',category:'Navy',icon:'users'},
  {type:'navy-process',name:'Navy · Ablaufübersicht',description:'Einzelne Schritte in einer klaren, interaktiven Folge darstellen.',category:'Navy',icon:'layers'},
  {type:'navy-contact',name:'Navy · Kontaktbereich',description:'Anfrage, Kontaktdaten und Bürozeiten in einer gemeinsamen Fläche.',category:'Navy',icon:'mail'}
];
export function sectionLibraryForModules(creatorEnabled: boolean, commerceConfigured: boolean, scroll3dEnabled = false, hospitality?: SiteConfig['modules']) {
  return sectionLibrary
    .filter(item => item.type !== 'scroll-3d' || scroll3dEnabled)
    .filter(item => item.type !== 'restaurant-menu' || hospitality?.restaurantMenu?.enabled)
    .filter(item => item.type !== 'reservation' || hospitality?.reservations?.enabled)
    .filter(item => !item.type.startsWith('creator-') || creatorEnabled || (item.type === 'creator-shop' && commerceConfigured))
    .map(item => item.type === 'creator-shop' && !creatorEnabled ? { ...item, name: 'Shop · Produkte und Warenkorb', category: 'Shop', description: 'Ihr eingerichtetes Sortiment mit Kasse.' } : item);
}
export function availableSectionLibrary(config?: SiteConfig) {
  return sectionLibraryForModules(config?.modules?.creator?.enabled === true, Boolean(config?.modules?.commerce), config?.modules?.scroll3d?.enabled === true, config?.modules);
}
export const defaultDesign:SectionDesign={theme:'light',headingFont:'display',fontScale:1,radius:12,border:0,spacing:'normal',width:'wide',imageSide:'right',columns:3,animation:'none',align:'left'};
const point=(title:string,text=''):ContentItem=>({id:crypto.randomUUID(),title,text});
const placeholderImage = {src:'/media/placeholder-landscape.svg',alt:'Bildplatzhalter; durch ein eigenes Motiv ersetzen',position:'50% 50%' as const};
const defaults:Partial<Record<SectionType,()=>SectionContent>>={
  'showcase-hero':()=>createStarterVisualContent('showcase-hero'),
  'scroll-story':()=>createStarterVisualContent('scroll-story'),
  'scene-sequence':()=>createStarterVisualContent('scene-sequence'),
  'workflow-demo':()=>createStarterVisualContent('workflow-demo'),
  'project-stage':()=>createStarterVisualContent('project-stage'),
  'affiliate-links':()=>({heading:'Empfehlungen und Partner',items:[]}),
  'project-index':()=>createStarterVisualContent('project-index'),
  'editorial-index':()=>createStarterVisualContent('editorial-index'),
 'newsletter-signup':()=>({heading:'Post von uns',text:'Melden Sie sich für Neuigkeiten und Termine an.',primaryLabel:'Anmelden',newsletterGroupId:''}),
 'newsletter-showcase':()=>({heading:'Newsletter und Webanalyse',text:'Schauen Sie sich eine Beispielausgabe an und entdecken Sie die Webanalyse im CMS.'}),
  'assistant-showcase':createAssistantShowcaseContent,
  'creator-scroll-story':createScrollStoryContent,
  'creator-engagement':createEngagementContent,
  'creator-journey':createJourneyContent,
  'creator-remix':createRemixContent,
  'creator-lens':createLensContent,
  'creator-orbit':createOrbitContent,
  'creator-demo':()=>({heading:'Probier deine Website aus.',text:'Navigiere durch das fiktive Beispiel und bearbeite deinen eigenen lokalen Arbeitsstand.',primaryLabel:'Website',secondaryLabel:'CMS',caption:'Creator-Beispiel'}),
  'creator-hero':()=>({heading:'Dein eigener Auftritt.',text:'Mit eigenen Inhalten und eigener Gestaltung.',image:{...placeholderImage},primaryLabel:'Mehr erfahren',primaryHref:'#inhalte'}),
  'creator-social':()=>({heading:'Deine Inhalte.',text:'Plattformbeispiele mit eigenen Medien.',items:[]}),
  'creator-shop':()=>({heading:'Dein Shop.',text:'Das Shop-Modul muss separat eingerichtet werden.',caption:'catalog'}),
  'creator-hero-stack':()=>({heading:'Ein Auftakt mit Charakter.',items:[]}),
  'creator-tools':()=>({heading:'Werkzeuge für deinen Alltag.',text:'Ideen sammeln, Abläufe ordnen und fertigen Content planen. Hier kannst du einen Post-Planer ausprobieren.',subheading:'Dein Ablauf bestimmt das Werkzeug.',caption:'Wir entwickeln individuelle Tools passend zu deinen Inhalten und Prozessen. Umfang und Anbindungen stimmen wir gemeinsam ab.',primaryLabel:'Tool besprechen',primaryHref:'/kontakt',items:[createPostPlannerItem(crypto.randomUUID()),{id:crypto.randomUUID(),title:'Bedienoberfläche',text:'Beschriftungen der lokalen Beispiele.',tags:['ui'],details:['session|Lokales Beispiel','reset|Zurücksetzen','close|Schließen','expand|Groß ausprobieren','collapse|Großansicht schließen']}]}),
  'creator-media-kit':()=>({heading:'Zusammenarbeiten.',items:[]}),
  'creator-links':()=>({heading:'Hier geht es weiter.',items:[]}),
  hero:()=>({heading:'Raum für Ihr Angebot.',text:'Beschreiben Sie hier, was Ihr Unternehmen anbietet und für wen.',primaryLabel:'Kontakt aufnehmen',primaryHref:'/kontakt',secondaryLabel:'Unsere Leistungen',secondaryHref:'/leistungen',image:{...placeholderImage}}),
  statement:()=>({heading:'Eine klare Aussage.',text:'Ersetzen Sie diesen Platzhalter durch eine belegbare Aussage über Ihr Unternehmen.'}),
  contact:()=>({heading:'Sprechen wir über Ihr Vorhaben.',text:'Sie erreichen uns über die hinterlegten Kontaktmöglichkeiten.'}),
  'restaurant-menu':()=>({heading:'Speisen & Getränke',text:'',restaurantMenu:{layout:'full'}}),
  reservation:()=>({heading:'Tisch reservieren',text:'',reservation:{layout:'card'}}),
  faq:()=>({heading:'Häufige Fragen.',items:[point('Ihre erste Frage','Ergänzen Sie eine zutreffende und hilfreiche Antwort.'),point('Ihre zweite Frage','Beantworten Sie eine tatsächliche Frage Ihrer Zielgruppe.')]}),
  steps:()=>({heading:'So beginnt die Zusammenarbeit.',items:[point('Kontakt aufnehmen','Klären Sie gemeinsam das Anliegen.'),point('Vorgehen abstimmen','Legen Sie die nächsten Schritte fest.'),point('Gemeinsam umsetzen','Beschreiben Sie den tatsächlichen Ablauf.')]}),
  cta:()=>({heading:'Lassen Sie uns sprechen.',text:'Beschreiben Sie den nächsten sinnvollen Schritt.',primaryLabel:'Kontakt aufnehmen',primaryHref:'/kontakt'}),
  split:()=>({heading:'Ihr Unternehmen.',text:'Ergänzen Sie hier eigene Informationen und ein freigegebenes Bild.',image:{...placeholderImage},primaryLabel:'Mehr erfahren',primaryHref:'/ueber-uns'}),
  gallery:()=>({heading:'Einblicke.',images:[{...placeholderImage}]}),
  downloads:()=>({heading:'Informationen zum Mitnehmen.',text:'Hier verlinken Sie eigene freigegebene Dateien.',items:[{...point('Beispieldatei','Diese Datei ist ein Platzhalter.'),href:'/downloads/beispiel.txt',label:'Datei herunterladen'}]}),
  list:()=>({heading:'Auf einen Blick.',items:[point('Ihr erster Punkt'),point('Ihr zweiter Punkt'),point('Ihr dritter Punkt')]}),
  'blog-cards':()=>({heading:'Neu im Blog',text:'',blogFeed:{limit:3,archiveLink:true}}),
  'blog-editorial':()=>({heading:'Einblicke und Geschichten',text:'',blogFeed:{limit:5,archiveLink:true}}),
  'blog-list':()=>({heading:'Aktuelle Beiträge',text:'',blogFeed:{limit:5,archiveLink:true}}),
  notice:()=>({heading:'Gut zu wissen.',text:'Ergänzen Sie hier einen tatsächlichen Hinweis.'}),
  announcement:()=>({heading:'Ankündigung',subheading:'',text:''}),
  'motion-story':()=>({
    heading:'Fuge für Fuge.',
    text:'Ein Sideboard aus Nussbaum nimmt Form an.',
    image:{...motionStoryStudioPoster},
    items:[],
  }),
  'scroll-3d':()=>({
    heading:'Fuge für Fuge.',
    subheading:'Sideboard aus Nussbaum',
    text:'Massivholz, ruhige Proportionen und Platz für die Dinge des Alltags.',
    image:{...motionStoryStudioPoster},
    items:[
      { ...point('Die Verbindung.', 'Passgenaue Fugen geben dem Korpus Halt.'), scroll3d:{ layout:'art-left', background:'#e6d2b5', textColor:'#302219' } },
      { ...point('Platz für den Alltag.', 'Hinter den Fronten bleibt Stauraum. Oben bleibt die Fläche frei.'), scroll3d:{ layout:'art-right', background:'#262b23', textColor:'#f6ebd9' } },
    ],
  }),
  map:()=>({heading:'Ihr Weg zu uns.',text:'Die Anschrift stammt aus den globalen Kontaktdaten.'}),
  'opening-hours':()=>({heading:'Unsere Erreichbarkeit.',text:'Ergänzen Sie die tatsächlichen Zeiten Ihres Betriebs.'}),
  video:()=>({heading:'Ein Einblick.',text:'',videoUrl:'',caption:''}),
  divider:()=>({heading:''}),
  team:()=>({heading:'Ihre Ansprechpersonen.',items:[]}),
  stats:()=>({heading:'Zahlen und Fakten.',text:'Nur belegbare Angaben veröffentlichen.',items:[]}),
  quote:()=>({heading:'',quote:'',attribution:''}),
  logos:()=>({heading:'',images:[]}),
  timeline:()=>({heading:'Unsere Geschichte.',items:[]}),
  services:()=>({heading:'Unsere Leistungen.',items:[]}),
  comparison:()=>({heading:'Möglichkeiten im Überblick.',items:[]}),
  cards:()=>({heading:'Mehr erfahren.',items:[]}),
  columns:()=>({heading:'Was Sie wissen sollten.',items:[]}),
  accordion:()=>({heading:'Weitere Informationen.',items:[]}),
  richtext:()=>({heading:'Wissen und Informationen.',text:''}),
  'comondi-map':()=>({heading:'Unsere Leistungen im Überblick.',text:'Ergänzen Sie für jede Welt die tatsächlichen Teilleistungen.',items:[]}),
  'comondi-pairs':()=>({heading:'Wie sich Themen verbinden.',items:[]}),
  'comondi-formats':()=>({heading:'Formen der Begleitung.',attribution:'Euer Team',items:[]}),
  'comondi-planet-hero':()=>({heading:'Eine Leistung.',text:'Beschreiben Sie, was diese Leistung umfasst.',primaryLabel:'Über euer Vorhaben sprechen',primaryHref:'/kontakt'}),
  'comondi-questions':()=>({heading:'Kommt euch das bekannt vor?',attribution:'So steigen wir ein',quote:'',primaryLabel:'Mit dieser Auswahl anfragen',primaryHref:'/kontakt',items:[point('Ihre erste Frage'),point('Ihre zweite Frage')]}),
  'comondi-service-work':()=>({heading:'Was wir konkret tun.',items:[]}),
  'comondi-related':()=>({heading:'Weiterlesen.',items:[]}),
  'comondi-next':()=>({heading:'Lasst uns sprechen.',text:'Beschreiben Sie den nächsten sinnvollen Schritt.',primaryLabel:'Kontakt aufnehmen',primaryHref:'/kontakt',items:[]}),
  'comondi-route':()=>({heading:'Unser gemeinsamer Weg.',items:[point('Erste Etappe','Beschreiben Sie den tatsächlichen Ablauf.'),point('Zweite Etappe','Beschreiben Sie den tatsächlichen Ablauf.')]}),
  'comondi-terms':()=>({heading:'Was beide Seiten einbringen.',items:[]}),
  'comondi-portraits':()=>({heading:'Die Menschen hinter dem Angebot.',items:[]}),
  'comondi-values':()=>({heading:'Unsere Haltung.',items:[]}),
  'comondi-constellation':()=>({heading:'Kompetenzen im Team.',items:[]}),
  'comondi-places':()=>({heading:'Standorte.',items:[]}),
  'comondi-magazine':()=>({heading:'Beiträge.',caption:'Alle',attribution:'Nach Thema filtern',items:[]}),
  'comondi-article':()=>({heading:'Titel des Beitrags.',text:'',items:[point('Erstes Kapitel','')]}),
  'comondi-after':()=>({heading:'Was nach eurer Nachricht passiert.',items:[]}),
};
export function createSection(type:SectionType):Section {
  const definition=sectionLibrary.find(x=>x.type===type)!;
  const aliases:Partial<Record<SectionType,SectionType>>={'editorial-hero':'hero','portrait-mosaic':'team','service-explorer':'services','editorial-statement':'statement','contact-poster':'cta','editorial-gallery':'gallery','cinematic-hero':'hero','focus-finder':'services','portrait-rail':'team','stacked-panels':'steps','kinetic-statement':'statement','contact-dock':'cta','noir-hero':'hero','case-deck':'services','people-index':'team','image-curtain':'gallery','noir-manifesto':'statement','noir-contact':'cta','navy-hero':'hero','navy-bento':'cards','navy-service-tabs':'services','navy-people':'team','navy-process':'steps','navy-contact':'contact'};
  const base=aliases[type]??type;
  const visual = ['showcase-hero', 'scroll-story', 'scene-sequence', 'workflow-demo', 'project-stage', 'project-index', 'editorial-index'].includes(type);
  const content:SectionContent = defaults[base]?.() ?? {heading:type.startsWith('blog-')?'Wissen und Einblicke.':definition.name,text:'',items:[]};
  if (visual && content.items) content.items = content.items.map(item => ({ ...item, id: crypto.randomUUID() }));
  const design:SectionDesign = {...defaultDesign};
  if (type === 'motion-story') Object.assign(design, {spacing:'compact',motionTrigger:'loop',motionEffect:'studio'});
  if (type === 'scroll-3d') Object.assign(design, {spacing:'compact',width:'full',theme:'dark',animation:'none'});
  if (base === 'cta') design.theme = 'accent';
  if (base === 'hero' || type === 'showcase-hero') design.spacing = 'compact';
  if (base === 'announcement') Object.assign(design, {spacing:'compact',theme:'soft'});
  if (comondiPageSectionTypes.includes(type)) Object.assign(design, {theme:'dark',headingFont:'sans',radius:24,animation:['comondi-map','comondi-planet-hero','comondi-route','comondi-portraits','comondi-magazine','comondi-article'].includes(type)?'none':'reveal'});
  if (type === 'comondi-planet-hero' || type === 'comondi-service-work') design.comondiPlanet = 'jupiter';
  if (type === 'scene-sequence') Object.assign(design, {theme:'dark',width:'full',spacing:'compact'});
  if (type === 'workflow-demo') design.theme = 'soft';
  if (visual || ['statement', 'services', 'team', 'split', 'cta', 'cards', 'gallery', 'quote', 'steps', 'comparison', 'columns', 'timeline'].includes(base) ||
    ['noir-manifesto', 'navy-bento', 'blog-cards', 'blog-editorial'].includes(type)) design.animation = 'reveal';
  return {id:crypto.randomUUID(),type,name:definition.name,visible:true,content,design};
}
