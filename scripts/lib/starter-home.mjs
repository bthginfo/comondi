import { starterArtwork } from '../../src/lib/starter-visuals.mjs';

// Complete starting homepages for the four standard profiles. Every section comes from the
// existing library and stays editable in the CMS. Copy is written from the provider's point of
// view; people, projects and values are visibly marked as examples until real content replaces them.

const portrait = {
  src: '/media/placeholder-portrait.svg',
  alt: 'Porträtplatzhalter; durch ein freigegebenes Foto der Ansprechperson ersetzen',
  position: '50% 50%',
};
const art = name => ({ ...starterArtwork[name] });
const entries = (prefix, list) => list.map((entry, index) => ({ id: `${prefix}-${index + 1}`, ...entry }));

/** @param {string} id @param {string} type @param {string} name @param {object} content @param {object} design */
const block = (id, type, name, content, design) => ({ id, type, name, visible: true, content, design });

function contactPerson(id, config, { heading, text, role, about, href, design = {} }) {
  return block(id, 'team', 'Ansprechperson', {
    heading, text,
    items: [{
      id: `${id}-1`, title: 'Vorname Nachname', meta: role, text: about, image: { ...portrait },
      email: config.email, phone: config.phone, href, label: 'Kontakt',
    }],
  }, design);
}

const closing = {
  services: {
    heading: 'Erzählen Sie uns von Ihrem Vorhaben.',
    text: 'Ein paar Sätze genügen: was, wo und bis wann. Wir melden uns mit einem Terminvorschlag für das Erstgespräch.',
    primaryLabel: 'Anfrage senden',
  },
  portfolio: {
    heading: 'Ein Projekt im Kopf?',
    text: 'Schreiben Sie mir, worum es geht und bis wann es fertig sein soll. Ich antworte mit ersten Fragen und einem Terminvorschlag.',
    primaryLabel: 'Projekt anfragen',
  },
  consulting: {
    heading: 'Ein Erstgespräch vereinbaren.',
    text: 'Schildern Sie kurz Ihre Ausgangslage. Wir schlagen einen Termin vor und klären vorab, welches Format passt.',
    primaryLabel: 'Termin anfragen',
  },
  editorial: {
    heading: 'Ein Thema für uns?',
    text: 'Schreiben Sie uns, worüber wir berichten sollten, oder fragen Sie nach einer Kooperation.',
    primaryLabel: 'Redaktion schreiben',
  },
  creator: {
    heading: 'Lass uns etwas zusammen machen.',
    text: 'Schreib mir, wenn du eine Idee oder eine Anfrage für eine Kooperation hast.',
  },
};

/** Closing call to action per profile; each asks for a concrete next step. */
export function closingCopy(profile) { return closing[profile]; }

function services({ config, cover, cta, feature, look }) {
  return [
    cover,
    block('home-offer', 'services', 'Leistungen', {
      heading: 'Was wir für Sie übernehmen.',
      text: 'Drei Beispiele für Leistungsbereiche, jeweils mit Umfang und Ergebnis.',
      items: entries('offer', [
        { title: 'Beratung vor Ort', icon: 'MessagesSquare', image: art('planning'), href: '/leistungen', label: 'Mehr zur Beratung',
          text: 'Wir sehen uns die Ausgangslage an, klären Wünsche und Rahmenbedingungen und sagen offen, was sinnvoll ist.',
          details: ['Termin vor Ort oder per Video', 'Kurzes Protokoll mit den nächsten Schritten'] },
        { title: 'Planung und Angebot', icon: 'FileText', image: art('editorial'), href: '/leistungen', label: 'Mehr zur Planung',
          text: 'Aus dem Gespräch entsteht ein nachvollziehbares Angebot mit Leistungen, Zeitrahmen und offenen Punkten.',
          details: ['Jede Position einzeln aufgeführt', 'Varianten, wenn es mehrere Wege gibt'] },
        { title: 'Umsetzung und Übergabe', icon: 'Wrench', image: art('architecture'), href: '/leistungen', label: 'Mehr zur Umsetzung',
          text: 'Wir setzen die vereinbarten Arbeiten um, halten Sie auf dem Laufenden und übergeben das Ergebnis mit allen Unterlagen.',
          details: ['Feste Ansprechperson während der Arbeiten', 'Übergabe mit Dokumentation'] },
      ]),
    }, look({ theme: 'light', spacing: 'normal' })),
    feature,
    block('home-work', 'project-stage', 'Projektgalerie', {
      heading: 'Arbeitsproben.',
      text: 'Drei Beispielprojekte mit Ausgangslage und Ergebnis.',
      items: entries('work', [
        { meta: 'Beispielprojekt · Innenausbau', title: 'Treppenhaus im Altbau', image: art('architecture'),
          text: 'Ausgangslage war ein dunkler Aufgang. Neue Stufen aus Naturstein, eine Wand aus Holzlamellen und mehr Tageslicht verändern den Raum.' },
        { meta: 'Beispielprojekt · Werkstatt', title: 'Bemusterung für einen Ladenbau', image: art('workshop'),
          text: 'Vor der Entscheidung standen Hölzer, Oberflächen und Beschläge im direkten Vergleich an der Werkbank.' },
        { meta: 'Beispielprojekt · Planung', title: 'Abstimmung mit der Bauherrschaft', image: art('planning'),
          text: 'Skizzen und Varianten am Tisch: So wird aus mehreren Ideen ein gemeinsamer Plan.' },
      ]),
    }, look({ theme: 'light', spacing: 'normal', imageSide: 'right' })),
    block('home-numbers', 'stats', 'Kennzahlen', {
      heading: 'Womit Sie planen können.',
      text: 'Beispielwerte für einen typischen Ablauf.',
      items: entries('number', [
        { title: '1', text: 'feste Ansprechperson', meta: 'vom Erstgespräch bis zur Übergabe' },
        { title: '5 Tage', text: 'bis zum schriftlichen Angebot', meta: 'Beispielwert' },
        { title: '3', text: 'Abstimmungstermine', meta: 'Beispiel für ein mittleres Vorhaben' },
      ]),
    }, look({ theme: 'dark', spacing: 'compact', columns: 3 })),
    contactPerson('home-person', config, {
      heading: 'Ihre Ansprechperson.',
      text: 'Eine Person begleitet Ihr Vorhaben vom ersten Gespräch bis zur Übergabe.',
      role: 'Projektleitung · Beispielprofil',
      about: 'Ich nehme Ihre Anfrage entgegen, komme zum Termin vor Ort und bin während der Arbeiten für Sie erreichbar.',
      href: '/ueber-uns', design: look({ theme: 'light', spacing: 'normal' }),
    }),
    block('home-faq', 'faq', 'Häufige Fragen', {
      heading: 'Fragen vor dem ersten Termin.',
      text: 'Preis, Dauer und Ablauf im Überblick.',
      items: entries('faq', [
        { title: 'Wie setzt sich der Preis zusammen?', text: 'Der Preis richtet sich nach Umfang, Material und Aufwand vor Ort. Nach dem Erstgespräch erhalten Sie ein schriftliches Angebot, in dem jede Position einzeln aufgeführt ist.' },
        { title: 'Wie lange dauert ein Vorhaben?', text: 'Das hängt von Umfang und Vorlauf ab. Im Angebot nennen wir einen Zeitrahmen mit Start- und Übergabetermin.' },
        { title: 'Wie läuft die Zusammenarbeit ab?', text: 'Erstgespräch, Angebot, Umsetzung und Übergabe. Vor jedem Schritt wissen Sie, was als Nächstes passiert und wer Ihre Ansprechperson ist.' },
        { title: 'Was hilft uns beim ersten Gespräch?', text: 'Fotos, Maße, vorhandene Pläne oder eine kurze Beschreibung genügen. Was noch fehlt, klären wir gemeinsam.' },
      ]),
    }, look({ theme: 'soft', spacing: 'normal' })),
    cta,
  ].map(section => ({ ...section, design: { ...look(), ...section.design } }));
}

function portfolio({ config, cover, cta, feature, look }) {
  return [
    cover,
    feature,
    block('home-statement', 'statement', 'Große Aussage', {
      heading: 'Ich gestalte Räume, Bilder und Publikationen.',
      text: 'Mich interessiert, wie Material, Licht und Form zusammenwirken. Jedes Projekt beginnt deshalb mit genauem Hinsehen: Was ist schon da, und was braucht eine neue Form?',
      primaryLabel: 'Über mich', primaryHref: '/ueber-uns',
    }, look({ theme: 'dark', spacing: 'airy' })),
    block('home-fields', 'editorial-index', 'Themenverzeichnis', {
      heading: 'Wobei ich unterstütze.',
      text: 'Drei Arbeitsfelder, einzeln oder kombiniert.',
      items: entries('field', [
        { meta: 'Raum', title: 'Raumkonzepte', image: art('architecture'), href: '/projekte', label: 'Beispiele ansehen',
          text: 'Von der Bestandsaufnahme bis zum Entwurf für Licht, Material und Möblierung.' },
        { meta: 'Bild', title: 'Fotografie', image: art('workshop'), href: '/projekte', label: 'Beispiele ansehen',
          text: 'Aufnahmen von Räumen, Objekten und Arbeitsprozessen für Website, Druck und Presse.' },
        { meta: 'Druck', title: 'Publikationen', image: art('editorial'), href: '/projekte', label: 'Beispiele ansehen',
          text: 'Konzept, Gestaltung und Produktionsbegleitung für Bücher, Kataloge und Broschüren.' },
      ]),
    }, look({ theme: 'light', spacing: 'normal' })),
    contactPerson('home-person', config, {
      heading: 'Wer hinter den Arbeiten steht.',
      text: 'Von der ersten Idee bis zur Übergabe sprechen Sie direkt mit mir.',
      role: 'Gestaltung und Fotografie · Beispielprofil',
      about: 'Ich arbeite an der Schnittstelle von Raum, Bild und Publikation und übernehme Konzept, Gestaltung und Abstimmung selbst.',
      href: '/ueber-uns', design: look({ theme: 'soft', spacing: 'normal' }),
    }),
    block('home-steps', 'steps', 'Ablauf', {
      heading: 'So entsteht ein Projekt.',
      text: 'Vier Schritte, die sich bei jedem Auftrag wiederholen.',
      items: entries('step', [
        { title: 'Kennenlernen', text: 'Sie erzählen, worum es geht. Ich frage nach Ziel, Zeitrahmen und vorhandenem Material.' },
        { title: 'Konzept', text: 'Ein erster Entwurf zeigt die Richtung. Gemeinsam entscheiden wir, was weiterverfolgt wird.' },
        { title: 'Ausarbeitung', text: 'Ich arbeite das Konzept aus und stimme Zwischenstände mit Ihnen ab.' },
        { title: 'Übergabe', text: 'Sie erhalten alle vereinbarten Dateien. Nutzungsrechte halten wir schriftlich fest.' },
      ]),
    }, look({ theme: 'light', spacing: 'compact', columns: 4 })),
    block('home-faq', 'faq', 'Häufige Fragen', {
      heading: 'Häufige Fragen.',
      text: 'Zu Kosten, Zeitplan und Zusammenarbeit.',
      items: entries('faq', [
        { title: 'Was kostet ein Projekt?', text: 'Das hängt von Umfang, Nutzungsrechten und Zeitrahmen ab. Nach einem ersten Gespräch erhalten Sie ein Angebot zum Festpreis oder mit einem klar benannten Tagessatz.' },
        { title: 'Wie lange dauert es?', text: 'Den Zeitplan legen wir zu Beginn gemeinsam fest. Er hängt vor allem davon ab, wie viele Abstimmungsrunden und Termine vor Ort nötig sind.' },
        { title: 'Wie läuft die Zusammenarbeit ab?', text: 'Nach dem Kennenlernen entwickle ich ein Konzept. Sie geben Rückmeldung, ich arbeite es aus und übergebe die Ergebnisse mit allen vereinbarten Dateien.' },
        { title: 'Wo sehe ich weitere Arbeiten?', text: 'Unter Projekte finden Sie Arbeiten mit Ausgangslage und Ergebnis. Im Gespräch zeige ich gern Beispiele, die zu Ihrem Vorhaben passen.' },
      ]),
    }, look({ theme: 'dark', spacing: 'normal' })),
    cta,
  ].map(section => ({ ...section, design: { ...look(), ...section.design } }));
}

function consulting({ config, cover, cta, feature, look }) {
  return [
    cover,
    block('home-topics', 'editorial-index', 'Themenverzeichnis', {
      heading: 'Wobei wir beraten.',
      text: 'Drei typische Ausgangslagen als Beispiel.',
      items: entries('topic', [
        { meta: 'Orientierung', title: 'Standort bestimmen', image: art('planning'), href: '/leistungen', label: 'Mehr erfahren',
          text: 'Wenn vieles gleichzeitig ansteht, ordnen wir Themen, Abhängigkeiten und Prioritäten.' },
        { meta: 'Entscheidung', title: 'Optionen vergleichen', image: art('editorial'), href: '/leistungen', label: 'Mehr erfahren',
          text: 'Wenn mehrere Wege möglich sind, machen wir Kosten, Aufwand und Folgen vergleichbar.' },
        { meta: 'Umsetzung', title: 'Vorhaben begleiten', image: art('architecture'), href: '/leistungen', label: 'Mehr erfahren',
          text: 'Wenn die Richtung steht, begleiten wir die Umsetzung in klaren Etappen.' },
      ]),
    }, look({ theme: 'light', spacing: 'normal' })),
    feature,
    block('home-formats', 'comparison', 'Gegenüberstellung', {
      heading: 'Drei Formate, klar abgerechnet.',
      text: 'Beispielformate. Der Umfang bestimmt den Preis; vor Beginn erhalten Sie ein schriftliches Angebot.',
      items: entries('format', [
        { title: 'Standortbestimmung', meta: 'Festpreis', href: '/kontakt', label: 'Anfragen',
          text: 'Ein bis zwei Termine, in denen wir die Ausgangslage aufnehmen und Optionen ordnen.',
          details: ['Ergebnis: schriftliche Zusammenfassung', 'Beispiel: zwei bis drei Wochen'] },
        { title: 'Projektbegleitung', meta: 'Nach Aufwand', href: '/kontakt', label: 'Anfragen',
          text: 'Wir arbeiten in vereinbarten Etappen mit und rechnen auf Basis eines Tagessatzes ab.',
          details: ['Aufwandsschätzung vorab', 'Übersicht zu jeder Etappe'] },
        { title: 'Sparring', meta: 'Monatliche Pauschale', href: '/kontakt', label: 'Anfragen',
          text: 'Regelmäßige Termine für Entscheidungen im laufenden Betrieb.',
          details: ['Umfang und Laufzeit nach Absprache', 'Kurze Notiz nach jedem Termin'] },
      ]),
    }, look({ theme: 'light', spacing: 'normal', columns: 3 })),
    contactPerson('home-person', config, {
      heading: 'Ihr Gegenüber im Gespräch.',
      text: 'Sie sprechen von Anfang an mit der Person, die Ihr Vorhaben begleitet.',
      role: 'Beratung · Beispielprofil',
      about: 'Ich führe das Erstgespräch, bereite die Optionen auf und bleibe während der Begleitung Ihre Ansprechperson.',
      href: '/ueber-uns', design: look({ theme: 'soft', spacing: 'normal' }),
    }),
    block('home-faq', 'faq', 'Häufige Fragen', {
      heading: 'Was Sie vor dem ersten Termin wissen sollten.',
      text: '',
      items: entries('faq', [
        { title: 'Wie wird abgerechnet?', text: 'Je nach Format zum Festpreis, nach Aufwand auf Basis eines Tagessatzes oder als monatliche Pauschale. Vor Beginn erhalten Sie ein schriftliches Angebot.' },
        { title: 'Wie lange dauert eine Beratung?', text: 'Eine Standortbestimmung umfasst im Beispiel zwei bis drei Wochen. Längere Begleitungen planen wir in Etappen, die jeweils mit einem Ergebnis abschließen.' },
        { title: 'Wie läuft das Erstgespräch ab?', text: 'Sie schildern Ihre Ausgangslage, wir stellen Fragen und schätzen ein, welches Format passt. Danach erhalten Sie eine kurze Zusammenfassung.' },
        { title: 'Wer arbeitet an meinem Vorhaben mit?', text: 'Sie haben eine feste Ansprechperson. Wer zusätzlich beteiligt ist, stimmen wir vor Beginn mit Ihnen ab.' },
      ]),
    }, look({ theme: 'light', spacing: 'normal' })),
    cta,
  ].map(section => ({ ...section, design: { ...look(), ...section.design } }));
}

function editorial({ config, cover, cta, feature, look, blogSlug }) {
  return [
    cover,
    block('home-magazine', 'blog-editorial', 'Leitbeitrag und Liste', {
      heading: 'Neu im Magazin', blogFeed: { limit: 4, archiveLink: true },
    }, look({ theme: 'light', spacing: 'normal' })),
    feature,
    block('home-sections', 'cards', 'Themenkarten', {
      heading: 'Rubriken.',
      text: 'Worüber wir regelmäßig schreiben.',
      items: entries('rubric', [
        { meta: 'Rubrik', title: 'Räume', image: art('architecture'), href: '/' + blogSlug, label: 'Beiträge lesen',
          text: 'Wohnungen, Ateliers und öffentliche Orte und die Entscheidungen hinter ihrer Gestaltung.' },
        { meta: 'Rubrik', title: 'Handwerk', image: art('workshop'), href: '/' + blogSlug, label: 'Beiträge lesen',
          text: 'Werkstätten, Materialien und Arbeitsschritte, aus der Nähe betrachtet.' },
        { meta: 'Rubrik', title: 'Gespräche', image: art('planning'), href: '/' + blogSlug, label: 'Beiträge lesen',
          text: 'Menschen, die gestalten, bauen oder sammeln, erzählen von ihrer Arbeit.' },
      ]),
    }, look({ theme: 'light', spacing: 'normal', columns: 3 })),
    block('home-statement', 'statement', 'Große Aussage', {
      heading: 'Wir schreiben über Dinge, die man anfassen kann.',
      text: 'Jede Geschichte beginnt an einem Ort, bei einem Material oder einer Person. Wir besuchen, fragen nach und zeigen, was wir gesehen haben.',
    }, look({ theme: 'soft', spacing: 'airy' })),
    contactPerson('home-person', config, {
      heading: 'Die Redaktion.',
      text: 'Themenvorschläge und Anfragen zu Kooperationen landen direkt bei uns.',
      role: 'Redaktionsleitung · Beispielprofil',
      about: 'Ich plane die Themen, nehme Vorschläge entgegen und beantworte Fragen zu Kooperationen.',
      href: '/ueber-uns', design: look({ theme: 'light', spacing: 'normal' }),
    }),
    block('home-faq', 'faq', 'Häufige Fragen', {
      heading: 'Fragen an die Redaktion.',
      text: 'Für Leserinnen, Autoren und Partner.',
      items: entries('faq', [
        { title: 'Wie kann ich ein Thema vorschlagen?', text: 'Schreiben Sie uns über das Kontaktformular, worum es geht und warum es unsere Leserinnen und Leser interessieren könnte. Wir melden uns, wenn das Thema zu unserer Planung passt.' },
        { title: 'Was kostet eine Kooperation?', text: 'Kooperationen kennzeichnen wir als Anzeige. Der Preis richtet sich nach Format, Umfang und Laufzeit; vorab erhalten Sie ein Angebot.' },
        { title: 'Wie lange dauert es bis zur Veröffentlichung?', text: 'Das hängt von Recherche, Terminen vor Ort und unserer Themenplanung ab. Den voraussichtlichen Termin nennen wir mit der Zusage.' },
        { title: 'Wie läuft ein Besuch für eine Reportage ab?', text: 'Wir vereinbaren einen Termin, sprechen vor Ort mit den Beteiligten und fotografieren. Vor der Veröffentlichung prüfen Sie die Fakten im Text.' },
      ]),
    }, look({ theme: 'dark', spacing: 'normal' })),
    cta,
  ].map(section => ({ ...section, design: { ...look(), ...section.design } }));
}

const compositions = { services, portfolio, consulting, editorial };

/**
 * @param {string} profile
 * @param {{config: object, cover: object, cta: object, feature: object, look: (overrides?: object) => object, blogSlug: string}} parts
 */
export function homeSections(profile, parts) {
  return compositions[profile](parts);
}

/** Example magazine posts so the editorial start page shows a working magazine. */
export function examplePosts(author = 'Redaktion') {
  const post = (slug, date, title, excerpt, image, paragraphs) => ({
    id: 'example-' + slug, slug, title, excerpt, author, date, updatedAt: date + 'T09:00:00.000Z', status: 'published',
    cover: art(image),
    sections: [{
      id: 'example-' + slug + '-text', type: 'richtext', name: 'Fließtext', visible: true,
      content: { heading: title, text: paragraphs.join('\n\n') },
      design: { theme: 'light', headingFont: 'display', fontScale: 1, radius: 10, border: 0, spacing: 'normal', width: 'normal', imageSide: 'right', columns: 3, animation: 'none', align: 'left' },
    }],
    seo: { title: title + ' · Beispielbeitrag', description: excerpt },
  });
  return [
    post('treppenhaus-aus-stein-und-holz', '2026-11-12', 'Ein Aufgang aus Stein und Holz',
      'Beispielbeitrag: Wie Naturstein, Holzlamellen und Tageslicht einen dunklen Treppenaufgang verändern.', 'architecture',
      ['Dieser Beispielbeitrag zeigt, wie eine Reportage im Magazin aufgebaut sein kann: ein Ort, eine Frage und die Entscheidungen, die zu einer Lösung geführt haben.',
        'Wir beginnen beim Ausgangszustand, sprechen mit den Beteiligten und zeigen die Details, die den Unterschied machen.']),
    post('werkbank-und-materialprobe', '2026-11-05', 'An der Werkbank',
      'Beispielbeitrag: Hölzer, Papiere und erste Muster – ein Besuch dort, wo aus einer Idee ein Gegenstand wird.', 'workshop',
      ['Dieser Beispielbeitrag steht für eine Geschichte aus der Werkstatt: Material, Werkzeug und die Menschen, die damit arbeiten.',
        'Wir beschreiben die Arbeitsschritte in ihrer Reihenfolge und fragen nach, warum gerade dieses Material gewählt wurde.']),
    post('ein-gespraech-ueber-entwuerfe', '2026-10-29', 'Ein Gespräch über Entwürfe',
      'Beispielbeitrag: Zwei Menschen, ein Tisch voller Skizzen und die Frage, wann eine Idee fertig ist.', 'planning',
      ['Dieser Beispielbeitrag steht für ein Gespräch mit einer Person aus Gestaltung, Handwerk oder Architektur.',
        'Im Mittelpunkt stehen die Fragen, die sich im Entwurf stellen, und die Entscheidungen, die daraus folgen.']),
  ];
}

