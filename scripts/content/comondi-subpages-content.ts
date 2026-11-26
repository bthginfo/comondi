/**
 * The new content of the co:mondi subpages. Every statement is taken from, or directly derived
 * from, the existing website content (worlds, service pages, Road2Goat, FAQ, team, articles,
 * imprint and privacy notice). People, e-mail addresses, phone numbers and portraits are read
 * from the current content, so a later change in the CMS is kept.
 */
import type { ContentItem, PageContent, Section, SectionDesign, SectionType, WebsiteContent } from '../../src/lib/types';

export const SUBPAGE_SLUGS = [
  'leistungen',
  'leistungen/projektmanagement',
  'leistungen/agile-transformation',
  'leistungen/hybride-zusammenarbeit',
  'leistungen/ki-im-arbeitsalltag',
  'zusammenarbeit',
  'ueber-uns',
  'aktuelles',
  'aktuelles/outdoor-agile-survivor',
  'aktuelles/abschluss-und-dann',
  'aktuelles/designkooperation-lis-lito',
  'kontakt',
] as const;
export type SubpageSlug = typeof SUBPAGE_SLUGS[number];
export interface SubpageContent { seo: PageContent['seo']; sections: Section[] }

const design = (animation: SectionDesign['animation'], extra: Partial<SectionDesign> = {}): SectionDesign => ({
  theme: 'dark', headingFont: 'sans', fontScale: 1, radius: 24, border: 0, spacing: 'normal', width: 'wide',
  imageSide: 'right', columns: 3, animation, align: 'left', ...extra,
});
const section = (id: string, type: SectionType, name: string, content: Section['content'], animation: SectionDesign['animation'] = 'reveal', extra: Partial<SectionDesign> = {}): Section =>
  ({ id, type, name, visible: true, anchor: id, content, design: design(animation, extra) });
const item = (id: string, title: string, text = '', extra: Partial<ContentItem> = {}): ContentItem => ({ id, title, text, ...extra });
const seo = (title: string, description: string): PageContent['seo'] => ({ title, description, image: '/comondi/og.png', noindex: false });

const fallbackPeople: ContentItem[] = [
  { id: 'eva', title: 'Eva Lohmüller', text: 'Für euren Bedarf und den ersten gemeinsamen Schritt.', label: 'Geschäftsführung', email: 'eva.lohmueller@comondi.de', phone: '+49 157 34908451', image: { src: '/comondi/people/eva-lohmueller.webp', alt: 'Eva Lohmüller', position: '50% 50%', width: 522, height: 527 } },
  { id: 'sebastian', title: 'Sebastian Kunerl', text: 'Für eure Fragen zu Zusammenarbeit und Veränderung.', label: 'Geschäftsführung', email: 'sebastian.kunerl@comondi.de', phone: '+49 170 9088413', image: { src: '/comondi/people/sebastian-kunerl.webp', alt: 'Sebastian Kunerl', position: '50% 50%', width: 342, height: 348 } },
];

/** Eva and Sebastian as they stand in the current content: the team on /ueber-uns, otherwise the start page or the contact page. */
export function currentPeople(content: WebsiteContent): ContentItem[] {
  const order = ['ueber-uns', '', 'kontakt'];
  const sources = order.flatMap(slug => content.pages.find(page => page.slug === slug)?.sections ?? [])
    .filter(candidate => ['comondi-team', 'comondi-portraits', 'comondi-contact', 'comondi-next'].includes(candidate.type))
    .flatMap(candidate => candidate.content.items ?? []);
  return fallbackPeople.map(fallback => {
    const found = sources.find(entry => entry.id === fallback.id || entry.email === fallback.email);
    const label = found?.label && found.label === found.label.toUpperCase() ? found.label.charAt(0) + found.label.slice(1).toLowerCase() : found?.label;
    return { id: fallback.id, title: found?.title || fallback.title, text: found?.text || fallback.text, label: label || fallback.label,
      email: found?.email || fallback.email, phone: found?.phone || fallback.phone, image: structuredClone(found?.image || fallback.image) };
  });
}

const serviceLinks = {
  projekte: '/kontakt?service=Projekt-+und+Prozessmanagement',
  agil: '/kontakt?service=Agile+Transformation+und+Change+Management',
  hybrid: '/kontakt?service=Hybride+Zusammenarbeit+und+Organisationsentwicklung',
  ki: '/kontakt?service=KI+im+Arbeitsalltag+und+Zukunftsf%C3%A4higkeit',
};
const articles = {
  outdoor: item('outdoor', 'Outdoor Agile Survivor', 'Agilität wird greifbar, wenn wir sie gemeinsam erleben. Ein Perspektivwechsel außerhalb des gewohnten Arbeitsumfelds.', { meta: 'Zusammenarbeit & Agilität', tags: ['Programm'], href: '/aktuelles/outdoor-agile-survivor', label: 'Beitrag lesen' }),
  abschluss: item('abschluss', 'Abschluss – und dann?', 'Der nächste Schritt muss nicht dem Standard folgen. Gedanken zu Entwicklung, Orientierung und neuen Möglichkeiten.', { meta: 'Menschen & Entwicklung', tags: ['Zweitägiger Kurs'], href: '/aktuelles/abschluss-und-dann', label: 'Beitrag lesen' }),
  design: item('design', 'Designkooperation lis.lito', 'Neue Perspektiven entstehen im Austausch. Ein Einblick in unsere Designkooperation mit lis.lito.', { meta: 'Verbindungen & Perspektiven', tags: ['Kooperation'], href: '/aktuelles/designkooperation-lis-lito', label: 'Beitrag lesen' }),
};

/** An article as a reading tip: the format tag belongs to the magazine only. */
const teaser = ({ tags: _format, ...article }: ContentItem): ContentItem => structuredClone(article);

function next(id: string, heading: string, text: string, primaryLabel: string, primaryHref: string, people: ContentItem[], secondary = { label: 'E-Mail an info@comondi.de', href: 'mailto:info@comondi.de' }): Section {
  return section(id, 'comondi-next', 'Nächster Schritt', { heading, subheading: 'Nächster Schritt', text, primaryLabel, primaryHref, secondaryLabel: secondary.label, secondaryHref: secondary.href, items: structuredClone(people) });
}

export function buildSubpages(current: WebsiteContent): Record<SubpageSlug, SubpageContent> {
  const people = currentPeople(current);
  return {
    leistungen: {
      seo: seo('Beratungsleistungen: Projekte, Agilität & KI | co:mondi', 'Alle Leistungen von co:mondi auf einer Karte: Projekt- und Prozessmanagement, agile Transformation, hybride Zusammenarbeit und KI im Arbeitsalltag.'),
      sections: [
        section('landkarte', 'comondi-map', 'Landkarte der vier Welten', {
          subheading: 'Leistungen',
          heading: 'Vier Welten.\nAlle Leistungen im Überblick.',
          text: 'Projekt- und Prozessmanagement, agile Transformation, hybride Zusammenarbeit und KI im Arbeitsalltag: Hier seht ihr alle Themen, bei denen wir euch unterstützen, und wie sie zusammenhängen.',
          caption: 'Die Verbindung zwischen Welten',
          items: [
            item('proven', 'Projekte & Prozesse', 'Wenn ein Vorhaben ein gemeinsames Ziel, Struktur und klare Zuständigkeiten braucht.', { meta: 'Bewährte Welt', details: ['Projekt- & Programmmanagement', 'Prozessmanagement', 'Organisationsaufbau', 'Anforderungsmanagement'], tags: ['A-SPICE', 'Systems Engineering'], href: '/leistungen/projektmanagement', label: 'Projekte & Prozesse im Detail' }),
            item('modern', 'Agile Transformation', 'Wenn neue Arbeitsweisen entstehen sollen, die Menschen im Alltag mittragen.', { meta: 'Moderne Welt', details: ['Agile Transformation', 'Change Management', 'Systemisches Coaching', 'Kultur & Kommunikation'], tags: ['SCRUM', 'SAFe®'], href: '/leistungen/agile-transformation', label: 'Agile Transformation im Detail' }),
            item('hybrid', 'Hybride Zusammenarbeit', 'Wenn bewährte Vorgehensweisen und agile Ansätze zusammenarbeiten sollen.', { meta: 'Hybride Welt', details: ['Situationsgerechte Methoden', 'Verbundene Arbeitsweisen', 'Operative Begleitung', 'Intelligent Tool-Chains'], href: '/leistungen/hybride-zusammenarbeit', label: 'Hybride Zusammenarbeit im Detail' }),
            item('next', 'KI im Arbeitsalltag', 'Wenn ihr wissen wollt, wo künstliche Intelligenz eure Arbeit sinnvoll unterstützt.', { meta: 'Nächste Welt', details: ['Potenziale bewerten', 'Anwendungsfälle entwickeln', 'Teams befähigen'], href: '/leistungen/ki-im-arbeitsalltag', label: 'KI im Arbeitsalltag im Detail' }),
          ],
        }, 'none'),
        section('kombinationen', 'comondi-pairs', 'Kombinationen', {
          subheading: 'Kombinationen',
          heading: 'Selten kommt ein Thema allein.',
          text: 'Viele Vorhaben berühren mehrere Welten. Ausgangspunkt ist immer euer konkreter Bedarf; danach verbinden wir die passenden Themen.',
          items: [
            item('struktur-agil', 'Euer Vorhaben braucht Struktur, und euer Team arbeitet bereits agil?', 'Dann verbinden wir Projekt- und Prozessmanagement mit agilen Ansätzen. Eine bestimmte Methode ist dafür keine Voraussetzung.', { details: ['Projekte & Prozesse', 'Agile Transformation'], href: '/leistungen/hybride-zusammenarbeit', label: 'Zur hybriden Zusammenarbeit' }),
            item('ki-wandel', 'KI soll in den Alltag, und dabei verändern sich Arbeitsweisen?', 'Wir bewerten mit euch den Einsatz von KI und begleiten die Veränderung, die neue Technologien für euer Team mit sich bringen.', { details: ['KI im Arbeitsalltag', 'Change Management'], href: '/leistungen/ki-im-arbeitsalltag', label: 'Zu KI im Arbeitsalltag' }),
            item('wandel-steuern', 'Die Transformation läuft, aber das Programm braucht Steuerung?', 'Veränderung betrifft Strukturen und Menschen zugleich. Wir verbinden Change Management mit Projekt- und Programmmanagement, damit Planung und Umsetzung zusammenpassen.', { details: ['Agile Transformation', 'Projekt- & Programmmanagement'], href: '/leistungen/agile-transformation', label: 'Zur agilen Transformation' }),
          ],
        }),
        section('begleitung', 'comondi-formats', 'Formen der Begleitung', {
          subheading: 'Formen der Begleitung',
          heading: 'Euer Bedarf bestimmt unsere Rolle.',
          text: 'Vom Workshop bis zur Mitarbeit im Projekt: Wir unterstützen dort, wo es euch wirklich entlastet.',
          attribution: 'Euer Team',
          caption: 'Die Formen lassen sich verbinden, zum Beispiel Coaching und operative Mitarbeit.',
          items: [
            item('workshop', 'Workshop', 'Wir bringen die Beteiligten zusammen, ordnen eure Fragen ein und halten Ergebnisse fest – auf Wunsch auch bildlich mit unserer Kooperationspartnerin lis.lito.', { meta: 'Impuls' }),
            item('coaching', 'Coaching', 'Systemisches Coaching schafft Raum für neue Perspektiven, eigenständiges Denken und Reflexion – für euer Team und für Einzelne.', { meta: 'Reflexion' }),
            item('begleitung', 'Begleitung', 'Wir denken strategisch mit, entwickeln mit euch Vorgehensweisen und bleiben dabei, bis sich zeigt, ob sie im Alltag funktionieren.', { meta: 'Strategie & Konzept' }),
            item('mitarbeit', 'Operative Mitarbeit', 'Wir übernehmen Aufgaben im Projekt und arbeiten im aktiven Doing mit, damit ihr neue Ansätze im Alltag erproben könnt.', { meta: 'Im Team' }),
          ],
        }),
        next('naechster-schritt', 'Welche Welt bewegt euch gerade?', 'Erzählt uns, wo ihr gerade steht. Wir besprechen mit euch, was als Nächstes sinnvoll ist.', 'Lass uns sprechen', '/kontakt', people),
      ],
    },

    'leistungen/projektmanagement': {
      seo: seo('Projekt- und Prozessmanagement | co:mondi', 'Projekt- und Programmmanagement, Prozesse, Organisationsaufbau und Anforderungen: co:mondi bringt Struktur in komplexe Vorhaben, auch im IT-Umfeld.'),
      sections: [
        section('projektmanagement-start', 'comondi-planet-hero', 'Einstieg Projekte & Prozesse', {
          subheading: 'Bewährte Welt · Projekte & Prozesse',
          heading: 'Struktur schaffen.\nVorhaben voranbringen.',
          text: 'Wir bringen Struktur in komplexe Vorhaben: mit Projekt- und Programmmanagement, klaren Prozessen und einem gemeinsamen Verständnis der Anforderungen.',
          primaryLabel: 'Über euer Vorhaben sprechen', primaryHref: serviceLinks.projekte,
          secondaryLabel: 'So arbeiten wir', secondaryHref: '/zusammenarbeit',
        }, 'none', { comondiPlanet: 'jupiter' }),
        section('projektmanagement-ausgangslage', 'comondi-questions', 'Ausgangslage & Einstieg', {
          subheading: 'Ausgangslage',
          heading: 'Kommt euch eine dieser Fragen bekannt vor?',
          text: 'Mit solchen Fragen unterstützen wir euch in Projekten und Prozessen.',
          attribution: 'So steigen wir ein',
          quote: 'Wir sehen uns euer Vorhaben gemeinsam an: Ziel, Beteiligte, Abläufe und Anforderungen. Daraus entsteht ein klares Bild davon, wo Struktur fehlt und womit wir beginnen.',
          caption: 'Markiert, was auf euch zutrifft. Eure Auswahl übernehmen wir in die Anfrage.',
          primaryLabel: 'Mit dieser Auswahl anfragen', primaryHref: serviceLinks.projekte,
          items: [
            item('ziel', 'Haben alle in eurem Vorhaben dasselbe Ziel im Blick?'),
            item('transparenz', 'Sind Aufgaben, Zuständigkeiten und Entscheidungen für alle transparent?'),
            item('ablaeufe', 'Passen eure Abläufe noch zu der Art, wie ihr zusammenarbeitet?'),
            item('anforderungen', 'Verstehen Fachbereich und Technik unter einer Anforderung dasselbe?'),
          ],
        }),
        section('projektmanagement-leistungen', 'comondi-service-work', 'Leistungsbild Strukturplan', {
          subheading: 'Was wir konkret tun',
          heading: 'Unsere Bausteine für Projekte und Prozesse.',
          text: 'Wir unterstützen strategisch, konzeptionell und im aktiven Doing – je nachdem, was euer Vorhaben braucht.',
          attribution: 'Euer Vorhaben',
          caption: 'Passende Methodenkompetenz im Team: A-SPICE und Systems Engineering.',
          items: [
            item('programm', 'Projekt- & Programmmanagement', 'Wir unterstützen euch dabei, Projekte und Programme zu strukturieren und im Alltag zu steuern.', { details: ['Gemeinsames Ziel festhalten', 'Aufgaben transparent machen', 'Entscheidungen vorbereiten, die das Team weiterbringen'] }),
            item('prozesse', 'Prozessmanagement', 'Wir betrachten Abläufe und Zuständigkeiten in ihrem Zusammenhang.', { details: ['Abläufe sichtbar machen', 'Zuständigkeiten klären', 'Strukturen entwickeln, die Zusammenarbeit erleichtern'] }),
            item('organisation', 'Organisationsaufbau', 'Gemeinsam entwickeln wir Strukturen, die Orientierung geben und sich in eure bestehende Organisation einfügen.', { details: ['Rollen und Verantwortung ordnen', 'Strukturen in machbaren Etappen einführen'] }),
            item('anforderungen', 'Anforderungsmanagement', 'Ein klares Verständnis von Anforderungen verbindet fachliche und technische Perspektiven – auch im IT-Umfeld.', { details: ['Anforderungen erheben', 'Anforderungen einordnen', 'Fachbereich und Technik abstimmen'] }),
          ],
        }, 'reveal', { comondiPlanet: 'jupiter' }),
        next('projektmanagement-kontakt', 'Euer Vorhaben braucht Struktur?', 'Erzählt uns, wo euer Projekt gerade steht. Im ersten Gespräch klären wir, ob und wie wir euch unterstützen können.', 'Über euer Vorhaben sprechen', serviceLinks.projekte, people),
      ],
    },

    'leistungen/agile-transformation': {
      seo: seo('Agile Transformation und Change Management | co:mondi', 'Agile Transformation, Change Management und systemisches Coaching: co:mondi begleitet neue Arbeitsweisen, bis Menschen sie im Alltag mittragen.'),
      sections: [
        section('agile-transformation-start', 'comondi-planet-hero', 'Einstieg Agile Transformation', {
          subheading: 'Moderne Welt · Agile Transformation',
          heading: 'Neue Arbeitsweisen.\nGemeinsam gelebt.',
          text: 'Neue Arbeitsweisen wirken erst, wenn Menschen sie mittragen. Wir begleiten agile Transformation, Veränderungsprozesse und eine Kultur, in der Zusammenarbeit gelingt.',
          primaryLabel: 'Über euer Vorhaben sprechen', primaryHref: serviceLinks.agil,
          secondaryLabel: 'So arbeiten wir', secondaryHref: '/zusammenarbeit',
        }, 'none', { comondiPlanet: 'neptune' }),
        section('agile-transformation-leistungen', 'comondi-service-work', 'Leistungsbild Kreislauf', {
          subheading: 'Was wir konkret tun',
          heading: 'In machbaren Etappen zu neuen Arbeitsweisen.',
          text: 'Agile Transformation, Change Management und systemisches Coaching greifen ineinander. Jede Etappe stärkt die Energie und das Selbstvertrauen für die nächste.',
          attribution: 'Neue Arbeitsweise im Alltag',
          caption: 'Passende Methodenkompetenz im Team: SCRUM, SAFe® und systemisches Coaching.',
          items: [
            item('arbeitsweisen', 'Arbeitsweisen anpassen', 'Agilität ist mehr als eine Methode. Wir passen Arbeitsweisen an eure Aufgaben an, denn nicht jeder Trend passt zu jeder Organisation.', { meta: 'Agile Transformation' }),
            item('beteiligen', 'Menschen beteiligen', 'Wir planen Veränderung mit Blick auf Kommunikation, Beteiligung und eure vorhandenen Ressourcen.', { meta: 'Change Management' }),
            item('reflektieren', 'Reflektieren', 'Wir betrachten mit euch, was Zusammenarbeit fördert und wie ihr eure Stärken weiterentwickelt.', { meta: 'Systemisches Coaching' }),
            item('kultur', 'Kultur stärken', 'Wertschätzung, Reflexion und Raum für Entwicklung werden Teil der täglichen Zusammenarbeit.', { meta: 'Kultur & Kommunikation' }),
          ],
        }, 'reveal', { comondiPlanet: 'neptune' }),
        section('agile-transformation-ausgangslage', 'comondi-questions', 'Ausgangslage & Einstieg', {
          subheading: 'Ausgangslage',
          heading: 'Fragen, die eine Transformation aufwirft.',
          text: 'Markiert, was euch gerade beschäftigt.',
          attribution: 'So steigen wir ein',
          quote: 'Wir lernen euer Umfeld kennen und klären, welche Arbeitsweisen zu euren Aufgaben passen. Dann gehen wir den Wandel in machbaren Etappen an – mit den Menschen, die ihn mittragen.',
          caption: 'Eure Auswahl übernehmen wir in die Anfrage.',
          primaryLabel: 'Mit dieser Auswahl anfragen', primaryHref: serviceLinks.agil,
          items: [
            item('methode', 'Wie wird Agilität bei euch mehr als eine neue Methode?'),
            item('menschen', 'Wie bezieht ihr die Menschen ein, die den Wandel tragen sollen?'),
            item('planung', 'Wie plant ihr eine Veränderung, die Strukturen und Menschen zugleich betrifft?'),
            item('reflexion', 'Wo braucht euer Team Raum für Reflexion und neue Perspektiven?'),
          ],
        }),
        section('agile-transformation-perspektive', 'comondi-related', 'Weiterlesen', {
          subheading: 'Aus unseren Perspektiven',
          heading: 'Agilität draußen erleben.',
          text: 'Wie agile Zusammenarbeit greifbar wird, wenn Teams sie gemeinsam erleben.',
          items: [teaser(articles.outdoor)],
        }),
        next('agile-transformation-kontakt', 'Neue Arbeitsweisen sollen bleiben?', 'Erzählt uns, was sich bei euch verändern soll. Gemeinsam klären wir, wie ein erster Schritt aussehen kann.', 'Über euer Vorhaben sprechen', serviceLinks.agil, people),
      ],
    },

    'leistungen/hybride-zusammenarbeit': {
      seo: seo('Hybride Zusammenarbeit und Organisationsentwicklung | co:mondi', 'Hybride Zusammenarbeit mit co:mondi: Wir verbinden etablierte Methoden mit agilen Ansätzen, passend zu euren Strukturen, Ressourcen und Menschen.'),
      sections: [
        section('hybride-zusammenarbeit-start', 'comondi-planet-hero', 'Einstieg Hybride Zusammenarbeit', {
          subheading: 'Hybride Welt · Hybride Zusammenarbeit',
          heading: 'Bewährtes behalten.\nNeues möglich machen.',
          text: 'Wir verbinden etablierte Methoden mit agilen Ansätzen. Ausgangspunkt sind eure Situation, eure Ressourcen und das, was euer Team im Alltag wirklich braucht.',
          primaryLabel: 'Über euer Vorhaben sprechen', primaryHref: serviceLinks.hybrid,
          secondaryLabel: 'So arbeiten wir', secondaryHref: '/zusammenarbeit',
        }, 'none', { comondiPlanet: 'saturn' }),
        section('hybride-zusammenarbeit-leistungen', 'comondi-service-work', 'Leistungsbild Brücke', {
          subheading: 'Klassisch und agil verbinden',
          heading: 'Es muss nicht die eine Methode sein.',
          text: 'Wir verbinden etablierte Vorgehensweisen mit agilen Ansätzen dort, wo die Kombination zu euren Aufgaben passt.',
          caption: 'Passende Methodenkompetenz im Team: SCRUM, SAFe®, A-SPICE und Systems Engineering.',
          items: [
            item('bewaehrt', 'Aus der bewährten Welt', 'Struktur, Planung und klare Zuständigkeiten.', { meta: 'Bewährte Welt', details: ['Projekt- & Programmmanagement', 'Prozessmanagement', 'Anforderungsmanagement'] }),
            item('methoden', 'Situationsgerechte Methoden', 'Klassisch, agil oder hybrid: Wir wählen Methoden nach eurer Situation.'),
            item('arbeitsweisen', 'Verbundene Arbeitsweisen', 'Ein Vorgehen, das sich in die bestehende Organisation einfügt und weiterentwickeln lässt.'),
            item('begleitung', 'Operative Begleitung', 'Wir unterstützen die praktische Umsetzung im Alltag.'),
            item('tool-chains', 'Intelligent Tool-Chains', 'Werkzeuge, die unterschiedliche Arbeitsschritte zusammendenken – betrachtet im Zusammenhang mit euren Abläufen.'),
            item('agil', 'Aus der agilen Welt', 'Neue Arbeitsweisen, die Menschen mittragen.', { meta: 'Moderne Welt', details: ['Agile Arbeitsweisen', 'Change Management', 'Systemisches Coaching'] }),
          ],
        }, 'reveal', { comondiPlanet: 'saturn' }),
        section('hybride-zusammenarbeit-ausgangslage', 'comondi-questions', 'Euer Needspace', {
          subheading: 'Euer Needspace',
          heading: 'Ausgangspunkt ist eure Situation.',
          text: 'Wir betrachten eure Strukturen, Rahmenbedingungen und Menschen. Daraus entsteht ein Vorgehen, das zu euch passt.',
          attribution: 'So steigen wir ein',
          quote: 'Wir lernen euer Umfeld kennen und schauen, was euer Team im Alltag wirklich braucht. Darauf bauen wir ein Vorgehen auf, das Bewährtes behält und Neues möglich macht.',
          caption: 'Markiert, was auf euch zutrifft. Eure Auswahl übernehmen wir in die Anfrage.',
          primaryLabel: 'Mit dieser Auswahl anfragen', primaryHref: serviceLinks.hybrid,
          items: [
            item('bewaehrt', 'Welche bewährten Abläufe tragen euch heute schon?'),
            item('agil', 'Wo möchtet ihr agiler arbeiten als bisher?'),
            item('rahmen', 'Welche Rahmenbedingungen und Ressourcen stehen fest?'),
            item('werkzeuge', 'Welche Werkzeuge nutzt ihr, und wie greifen sie ineinander?'),
          ],
        }),
        next('hybride-zusammenarbeit-kontakt', 'Klassisch, agil oder beides?', 'Erzählt uns, wie ihr heute arbeitet. Gemeinsam finden wir die Verbindung, die zu eurem Team passt.', 'Über euer Vorhaben sprechen', serviceLinks.hybrid, people),
      ],
    },

    'leistungen/ki-im-arbeitsalltag': {
      seo: seo('KI im Arbeitsalltag und Zukunftsfähigkeit | co:mondi', 'KI im Arbeitsalltag mit co:mondi: Potenziale bewerten, Anwendungsfälle entwickeln und Teams befähigen – ausgehend von einer konkreten Aufgabe.'),
      sections: [
        section('ki-im-arbeitsalltag-start', 'comondi-planet-hero', 'Einstieg KI im Arbeitsalltag', {
          subheading: 'Nächste Welt · KI im Arbeitsalltag',
          heading: 'Neue Möglichkeiten.\nGreifbar für euer Team.',
          text: 'Wir machen neue Möglichkeiten greifbar. Gemeinsam bewerten wir, wo künstliche Intelligenz eure Arbeit sinnvoll unterstützt – und wie sie Teil eures Alltags werden kann.',
          primaryLabel: 'Über euer Vorhaben sprechen', primaryHref: serviceLinks.ki,
          secondaryLabel: 'So arbeiten wir', secondaryHref: '/zusammenarbeit',
        }, 'none', { comondiPlanet: 'moon' }),
        section('ki-im-arbeitsalltag-ausgangslage', 'comondi-questions', 'Ausgangslage & Einstieg', {
          subheading: 'Ausgangslage',
          heading: 'Am Anfang steht eine konkrete Aufgabe.',
          text: 'Allgemeine Möglichkeiten gibt es viele. Wir helfen euch, die Frage zu finden, bei der KI eure Arbeit sinnvoll unterstützt.',
          attribution: 'So steigen wir ein',
          quote: 'Wir wählen mit euch eine konkrete Aufgabe aus und analysieren, welche Möglichkeiten KI dafür eröffnet und wo ein Einsatz sinnvoll ist.',
          caption: 'Markiert, was euch beschäftigt. Eure Auswahl übernehmen wir in die Anfrage.',
          primaryLabel: 'Mit dieser Auswahl anfragen', primaryHref: serviceLinks.ki,
          items: [
            item('aufgabe', 'Bei welcher Aufgabe in eurem Alltag könnte KI unterstützen?'),
            item('nutzen', 'Welchen Nutzen erwartet ihr, und welche Voraussetzungen braucht es?'),
            item('team', 'Was verändert sich für euer Team, wenn neue Werkzeuge dazukommen?'),
            item('alltag', 'Wie wird aus einem ersten Versuch ein Teil eures Alltags?'),
          ],
        }),
        section('ki-im-arbeitsalltag-leistungen', 'comondi-service-work', 'Leistungsbild Phasen', {
          subheading: 'Was wir konkret tun',
          heading: 'Von der ersten Idee zum Teil eures Alltags.',
          text: 'Wir gehen den Einsatz von KI in nachvollziehbaren Schritten an und beziehen euer Team von Anfang an ein.',
          items: [
            item('potenziale', 'Potenziale bewerten', 'Wir analysieren mit euch, welche neuen Möglichkeiten KI eröffnet und wo ein Einsatz im Arbeitsalltag denkbar ist.'),
            item('anwendungsfaelle', 'Anwendungsfälle entwickeln', 'Aus allgemeinen Möglichkeiten werden nachvollziehbare Anwendungsfälle. Wir ordnen Nutzen, Voraussetzungen und Auswirkungen für eure Organisation ein.'),
            item('befaehigen', 'Teams befähigen', 'Neue Technologien verändern Arbeitsweisen. Wir begleiten den Umgang mit Neuem und unterstützen euer Team dabei, die nächsten Schritte bewusst zu gestalten.'),
            item('verankern', 'Im Alltag verankern', 'Unser Auftrag ist erst erfüllt, wenn die Lösung im Alltag lebt. Bis dahin bleiben wir ansprechbar.'),
          ],
        }, 'reveal', { comondiPlanet: 'moon' }),
        next('ki-im-arbeitsalltag-kontakt', 'Welche Aufgabe soll KI erleichtern?', 'Erzählt uns, wo ihr gerade steht. Wir besprechen mit euch, wo ein sinnvoller Einstieg liegt.', 'Über euer Vorhaben sprechen', serviceLinks.ki, people),
      ],
    },

    zusammenarbeit: {
      seo: seo('Zusammenarbeit von Auftragsklärung bis Handover | co:mondi', 'Road2Goat: So arbeitet co:mondi mit euch – von der ehrlichen Auftragsklärung über gemeinsames Anpacken bis zur Übergabe. Mit Erwartungen, Tempo und Fragen.'),
      sections: [
        section('road2goat', 'comondi-route', 'Road2Goat-Route', {
          subheading: 'Zusammenarbeit · Road2Goat',
          heading: 'Wir bleiben dabei.\nBis Veränderung Alltag wird.',
          text: 'Eine gute Idee ist ein Anfang. Wir gehen den Weg mit euch weiter: von der ehrlichen Auftragsklärung über das gemeinsame Anpacken bis zu Routinen, die euer Team selbst trägt.',
          primaryLabel: 'Lass uns sprechen', primaryHref: '/kontakt',
          attribution: 'Start: eure erste Frage',
          caption: 'Ziel: Die Lösung lebt im Alltag – auch ohne uns.',
          items: [
            item('kennenlernen', 'Auftrag klären', 'Wir hören zu, klären euren Bedarf und lernen euer Umfeld kennen. Gemeinsam prüfen wir ehrlich, ob eure Erwartungen und unsere Kompetenzen und Ressourcen zusammenpassen.', { label: 'Erst verstehen. Dann losgehen.', details: ['Bedarf und Erwartungen klären', 'Umfeld kennenlernen', 'Ehrlich prüfen, ob es passt'] }),
            item('begleiten', 'Gemeinsam anpacken', 'Wir begleiten euch strategisch, konzeptionell und operativ. Wir bleiben dabei, bis sich zeigt, ob die gemeinsam entwickelten Arbeitsweisen in eurem Alltag funktionieren.', { label: 'Mit euch im Team.', details: ['Strategisch', 'Konzeptionell', 'Operativ'] }),
            item('loesung', 'Lösung entwickeln', 'Nicht jeder Trend passt zu jeder Organisation. Aus Erfahrung und Theorie entwickeln wir den Ansatz, der zu eurer Situation passt und anpassungsfähig bleibt.', { label: 'Euer Bedarf gibt die Richtung vor.', details: ['Erfahrung und Theorie verbinden', 'Passend zu eurer Situation', 'Anpassungsfähig bleiben'] }),
            item('tempo', 'Tempo abstimmen', 'So schnell wie möglich, so achtsam wie nötig: Wir berücksichtigen eure Strukturen, Rahmenbedingungen und die Menschen, die Veränderung mitgestalten.', { label: 'Fortschritt, der alle mitnimmt.', details: ['Strukturen', 'Rahmenbedingungen', 'Menschen'] }),
            item('mindset', 'Veränderung begleiten', 'Wir teilen den Weg in machbare Etappen. So fördern wir die Energie und das Selbstvertrauen, mit denen euer Team auch die nächsten Veränderungen angehen kann.', { label: 'Energie gewinnen. Weiterkommen.', details: ['Machbare Etappen', 'Energie und Selbstvertrauen stärken'] }),
            item('handover', 'Verantwortung übergeben', 'Unser Auftrag ist erst erfüllt, wenn die Lösung im Alltag lebt. Bis dahin bleiben wir als Sparringspartner ansprechbar und unterstützen euch im Shadow-Modus.', { label: 'Damit es auch ohne uns weitergeht.', details: ['Sparringspartner', 'Shadow-Modus'] }),
          ],
        }, 'none'),
        section('erwartungen', 'comondi-terms', 'Erwartungen & Tempo', {
          subheading: 'Was ihr erwarten könnt',
          heading: 'Klare Erwartungen auf beiden Seiten.',
          text: 'Zusammenarbeit gelingt, wenn beide Seiten wissen, was sie einbringen. So verstehen wir unseren Teil – und das brauchen wir von euch.',
          attribution: 'Unser Tempo',
          quote: 'So schnell wie möglich. So achtsam wie nötig.',
          caption: 'Wir berücksichtigen eure Strukturen, Rahmenbedingungen und die Menschen, die Veränderung mitgestalten. Den Weg teilen wir in machbare Etappen.',
          items: [
            item('klaerung', 'Ehrliche Auftragsklärung', 'Wir prüfen gemeinsam, ob eure Erwartungen und unsere Kompetenzen und Ressourcen zusammenpassen.', { meta: 'Von uns' }),
            item('rolle', 'Eine Rolle nach eurem Bedarf', 'Wir denken strategisch, entwickeln Konzepte mit euch und arbeiten operativ mit.', { meta: 'Von uns' }),
            item('ansatz', 'Ein Ansatz, der zu euch passt', 'Aus Erfahrung und Theorie entwickeln wir den Ansatz, der zu eurer Situation passt und anpassungsfähig bleibt.', { meta: 'Von uns' }),
            item('ansprechbar', 'Ansprechbar bis zum Schluss', 'Bis die Lösung im Alltag lebt, bleiben wir als Sparringspartner an eurer Seite.', { meta: 'Von uns' }),
            item('einblick', 'Einblick in euer Umfeld', 'Erzählt uns offen von eurer Situation, euren Fragen und Erwartungen. Daraus entsteht ein gemeinsames Verständnis davon, was gebraucht wird.', { meta: 'Von euch' }),
            item('menschen', 'Menschen, die mitgestalten', 'Veränderung braucht die Menschen, die sie mittragen. Deshalb arbeiten wir direkt mit eurem Team.', { meta: 'Von euch' }),
            item('offenheit', 'Offenheit für Neues', 'Neue Ansätze wirken, wenn ihr sie im Alltag erprobt und weiterentwickelt.', { meta: 'Von euch' }),
            item('verantwortung', 'Verantwortung übernehmen', 'Am Ende tragt ihr die Routinen selbst. Bis dahin übergeben wir Schritt für Schritt.', { meta: 'Von euch' }),
          ],
        }),
        section('fragen', 'comondi-faq', 'Fragen zur Zusammenarbeit', {
          subheading: 'Fragen zur Zusammenarbeit',
          heading: 'Gut zu wissen,\nbevor wir starten.',
          items: [
            item('f4', 'Wie beginnt eine Zusammenarbeit?', 'Mit einem Gespräch über eure Situation. Wir klären Erwartungen, lernen euer Umfeld kennen und prüfen gemeinsam, ob unsere Kompetenzen und Ressourcen zu eurem Vorhaben passen.'),
            item('f2', 'Arbeitet ihr auch operativ im Team mit?', 'Ja. Wir unterstützen strategisch, konzeptionell und im aktiven Doing. Je nach Bedarf übernehmen wir operative Aufgaben, coachen euer Team oder verbinden beides.'),
            item('f3', 'Müssen wir bereits agil arbeiten?', 'Nein. Wir verbinden klassische und agile Vorgehensweisen so, dass sie zu eurer Organisation passen. Eine bestimmte Methode ist keine Voraussetzung für die Zusammenarbeit.'),
            item('tempo', 'Wie schnell geht es voran?', 'So schnell wie möglich, so achtsam wie nötig. Das Tempo richtet sich nach eurem Team, euren Strukturen und Rahmenbedingungen.'),
            item('ende', 'Wann endet unsere Begleitung?', 'Wenn die Lösung im Alltag lebt. Bis dahin bleiben wir als Sparringspartner ansprechbar und unterstützen euch im Shadow-Modus.'),
            item('f5', 'Wo ist co:mondi tätig?', 'co:mondi ist eine Unternehmensberatung aus München und Stuttgart. Wie und wo wir mit euch zusammenarbeiten, besprechen wir passend zu eurem Projekt.'),
          ],
        }),
        next('naechster-schritt', 'Bereit für die erste Etappe?', 'Am Anfang steht ein Gespräch über eure Situation. Danach entscheiden wir gemeinsam, ob und wie wir den Weg zusammen gehen.', 'Lass uns sprechen', '/kontakt', people),
      ],
    },

    'ueber-uns': {
      seo: seo('Über uns: Eva Lohmüller und Sebastian Kunerl | co:mondi', 'co:mondi ist eine agile Unternehmensberatung aus München und Stuttgart. Lernt Eva Lohmüller und Sebastian Kunerl, unsere Haltung und Kompetenzen kennen.'),
      sections: [
        section('menschen', 'comondi-portraits', 'Porträts', {
          subheading: 'Über co:mondi',
          heading: 'Zwei Menschen.\nEine gemeinsame Art zu arbeiten.',
          text: 'Wir sind eine agile Unternehmensberatung aus München und Stuttgart. Wir verbinden unterschiedliche Erfahrungen mit einer gemeinsamen Art zu arbeiten: eigenständig, wertschätzend und mit Blick auf das, was euch hilft.',
          primaryLabel: 'Lass uns sprechen', primaryHref: '/kontakt',
          items: structuredClone(people),
        }, 'none'),
        section('haltung', 'comondi-values', 'Haltung', {
          subheading: 'Haltung · Attitude of Mind',
          heading: 'Unsere Energie? Das Miteinander.',
          text: 'Kolleginnen und Kollegen sind für uns ein Team. Wir schaffen Raum, um mitzugestalten, Neues auszuprobieren und die eigenen Stärken weiterzuentwickeln.',
          items: [
            item('team', 'Ein Team.', 'Wir sehen euch als Teil des Teams. Wissen teilen wir, Verantwortung übernehmen wir gemeinsam.', { meta: 'Miteinander' }),
            item('hands-on', 'Hands-on.', 'Wir packen dort mit an, wo Unterstützung gebraucht wird – im Coaching, in der operativen Mitarbeit oder in beidem.', { meta: 'Rolle' }),
            item('energie', 'Energie.', 'Veränderung braucht Energie. Wir stärken, was Menschen gut können, und geben Wertschätzung und Reflexion Raum.', { meta: 'Entwicklung' }),
          ],
        }),
        section('kompetenzen', 'comondi-constellation', 'Kompetenz-Sternbild', {
          subheading: 'Kompetenzen im Team',
          heading: 'Erfahrung, die wir in eure Welt mitbringen.',
          text: 'Methoden aus der bewährten und der modernen Welt, dazu systemisches Coaching: Diese Kompetenzen verbinden wir im Team.',
          items: [
            item('scrum', 'SCRUM', '', { meta: 'Agile Transformation' }),
            item('safe', 'SAFe®', '', { meta: 'Agile Transformation' }),
            item('aspice', 'A-SPICE', '', { meta: 'Projekte & Prozesse' }),
            item('systems', 'Systems Engineering', '', { meta: 'Projekte & Prozesse' }),
            item('coaching', 'Systemisches Coaching', '', { meta: 'Menschen & Kultur' }),
          ],
        }),
        section('standorte', 'comondi-places', 'Standorte', {
          subheading: 'Standorte',
          heading: 'München & Stuttgart.',
          text: 'co:mondi ist eine Unternehmensberatung aus München und Stuttgart. Wie und wo wir mit euch zusammenarbeiten, besprechen wir passend zu eurem Projekt.',
          caption: 'co:mondi',
          items: [
            item('muenchen', 'München', 'Poschingerstr. 9\n81679 München', { meta: 'Anschrift der comondi GmbH' }),
            item('stuttgart', 'Stuttgart', '', { meta: 'Standort' }),
          ],
        }),
        next('naechster-schritt', 'Lernt uns persönlich kennen.', 'Erzählt uns, was euch beschäftigt. Wir melden uns persönlich bei euch.', 'Lass uns sprechen', '/kontakt', []),
      ],
    },

    aktuelles: {
      seo: seo('Perspektiven, Einblicke und neue Verbindungen | co:mondi', 'Gedanken und Einblicke von co:mondi: agile Zusammenarbeit, persönliche Entwicklung und neue Verbindungen.'),
      sections: [
        section('beitraege', 'comondi-magazine', 'Magazin', {
          subheading: 'Perspektiven',
          heading: 'Neue Perspektiven.\nAndere Verbindungen.',
          text: 'Manchmal braucht es einen anderen Blick, um weiterzukommen. Hier teilen wir Einblicke in die Themen und Verbindungen, die co:mondi bewegen.',
          attribution: 'Themen',
          caption: 'Alle',
          items: [structuredClone(articles.outdoor), structuredClone(articles.abschluss), structuredClone(articles.design)],
        }, 'none'),
        next('naechster-schritt', 'Ein Thema hat euch neugierig gemacht?', 'Schreibt uns. Wir erzählen euch mehr über unsere Programme, Kurse und Kooperationen.', 'Lass uns sprechen', '/kontakt', []),
      ],
    },

    'aktuelles/outdoor-agile-survivor': {
      seo: seo('Outdoor Agile Survivor | co:mondi', 'Outdoor Agile Survivor: agile Methoden draußen gemeinsam erleben und die Erfahrungen in den Arbeitsalltag übertragen. Mit den Modulen Scrum, Team, Eco und Live.'),
      sections: [
        section('outdoor-agile-survivor-beitrag', 'comondi-article', 'Beitrag', {
          subheading: 'Zusammenarbeit & Agilität',
          heading: 'Agilität erleben.\nDraußen. Gemeinsam.',
          text: 'Agile Methoden werden verständlicher, wenn wir sie erleben. Das Outdoor Agile Survivor Programm verbindet praktische Gruppenarbeit in der Natur mit dem Transfer in den Unternehmensalltag.',
          attribution: '', caption: '',
          quote: 'Auf einen Blick\nFormat: Gruppenarbeit in der Natur mit Transfer in den Arbeitsalltag\nOrt: Eventgelände von simply outdoor\nModule: Scrum, Team, Eco und Live',
          primaryLabel: 'Mehr dazu erfahren', primaryHref: '/kontakt?thema=Outdoor+Agile+Survivor',
          items: [
            item('outdoor-agile-survivor-0', 'Agile Methoden praktisch erfahren', 'Auf dem Eventgelände von simply outdoor arbeiten Teilnehmende gemeinsam an Aufgaben. Dabei erleben sie, was agile Zusammenarbeit bedeutet, welche Vorteile sie bieten kann und welche Denkweisen dafür hilfreich sind.'),
            item('outdoor-agile-survivor-1', 'Vom Erleben in den Arbeitsalltag', 'Die Erfahrungen bleiben nicht auf dem Gelände. Teams reflektieren die gemeinsame Arbeit, ziehen Lehren aus dem Erlebten und übertragen ihre Erkenntnisse auf die Zusammenarbeit im Unternehmen.'),
            item('outdoor-agile-survivor-2', 'Vier Module, unterschiedliche Schwerpunkte', 'Die Kursmodule Scrum, Team, Eco und Live verbinden spezifisches Wissen mit strategischen Zielen für unterschiedliche Zielgruppen. Welche Ausgestaltung zu eurem Team passt, klären wir im Gespräch.'),
          ],
        }, 'none'),
        section('outdoor-agile-survivor-weiterlesen', 'comondi-related', 'Weiterlesen', { subheading: 'Weiterlesen', heading: 'Weitere Perspektiven.', items: [teaser(articles.abschluss), teaser(articles.design)] }),
        next('outdoor-agile-survivor-cta', 'Agilität im Team erleben?', 'Welche Ausgestaltung zu eurem Team passt, klären wir im Gespräch.', 'Mehr dazu erfahren', '/kontakt?thema=Outdoor+Agile+Survivor', []),
      ],
    },

    'aktuelles/abschluss-und-dann': {
      seo: seo('Abschluss – und dann? | co:mondi', 'Abschluss – und dann? Ein zweitägiger Kurs mit Methoden der systemischen Beratung, um die eigene Situation zu reflektieren und den nächsten Schritt zu finden.'),
      sections: [
        section('abschluss-und-dann-beitrag', 'comondi-article', 'Beitrag', {
          subheading: 'Menschen & Entwicklung',
          heading: 'Dein Abschluss.\nDeine nächste Welt.',
          text: 'Nach dem Abschluss stehen viele Möglichkeiten offen. Unser zweitägiger Kurs unterstützt dich dabei, deine Situation zu reflektieren und deinen eigenen nächsten Schritt zu entwickeln.',
          attribution: '', caption: '',
          quote: 'Auf einen Blick\nDauer: zwei Tage\nMethoden: aus der systemischen Beratung\nTermine, Orte und Konditionen: auf Anfrage an info@comondi.de',
          primaryLabel: 'Termine anfragen', primaryHref: '/kontakt?thema=Abschluss+%E2%80%93+und+dann%3F',
          items: [
            item('abschluss-und-dann-0', 'Raum für dein persönliches Anliegen', 'Welche Richtung passt zu mir? Was ist mir wichtig? Mit Methoden aus der systemischen Beratung gehst du dein Anliegen an und lernst Werkzeuge kennen, um dich selbst besser zu verstehen.'),
            item('abschluss-und-dann-1', 'Ich, meine Umgebung und die Welt', 'In drei Themenbereichen reflektierst du deine individuelle Situation, Interessen und Optionen. Im abschließenden Teil Meine Welt führst du die Erkenntnisse zu einem persönlichen Bild deiner Zukunft zusammen.'),
            item('abschluss-und-dann-2', 'Aktuelle Durchführung anfragen', 'Der Kurs ist auf zwei Tage angelegt. Für aktuelle Termine, Veranstaltungsorte, Gruppengrößen und Konditionen schreib uns an info@comondi.de. Wir besprechen die Möglichkeiten mit dir.'),
          ],
        }, 'none'),
        section('abschluss-und-dann-weiterlesen', 'comondi-related', 'Weiterlesen', { subheading: 'Weiterlesen', heading: 'Weitere Perspektiven.', items: [teaser(articles.outdoor), teaser(articles.design)] }),
        next('abschluss-und-dann-cta', 'Deinen nächsten Schritt entwickeln?', 'Für aktuelle Termine, Veranstaltungsorte, Gruppengrößen und Konditionen schreib uns. Wir besprechen die Möglichkeiten mit dir.', 'Termine anfragen', '/kontakt?thema=Abschluss+%E2%80%93+und+dann%3F', []),
      ],
    },

    'aktuelles/designkooperation-lis-lito': {
      seo: seo('Designkooperation lis.lito | co:mondi', 'Mit unserer Kooperationspartnerin Lisa von lis.lito verbinden wir Beratung mit Gestaltung – für uns und für unsere Kunden.'),
      sections: [
        section('designkooperation-lis-lito-beitrag', 'comondi-article', 'Beitrag', {
          subheading: 'Verbindungen & Perspektiven',
          heading: 'Wenn Gedanken\neine Form bekommen.',
          text: 'Mit unserer Kooperationspartnerin Lisa von lis.lito verbinden wir Beratung mit Gestaltung – für uns und für unsere Kunden.',
          attribution: '', caption: '',
          quote: 'Auf einen Blick\nPartnerin: Lisa von lis.lito\nGestaltung: Webseitendesign, kreativer Input, bildliche Protokollierung von Workshops',
          primaryLabel: 'Lass uns sprechen', primaryHref: '/kontakt?thema=Designkooperation+lis.lito',
          items: [
            item('designkooperation-lis-lito-0', 'Kreativer Input für neue Perspektiven', 'Ob Webseitendesign, kreativer Input oder die bildliche Protokollierung eines Workshops: In unserer Kooperation mit lis.lito werden Gedanken und Zusammenhänge sichtbar.'),
            item('designkooperation-lis-lito-1', 'Beratung und Gestaltung verbinden', 'Eine gemeinsame visuelle Sprache kann dabei helfen, Inhalte zu vermitteln und Workshop-Ergebnisse festzuhalten. Je nach Aufgabe beziehen wir die passende Gestaltungsperspektive ein.'),
            item('lislito-link', 'Mehr von lis.lito', 'Weitere Impressionen aus der Arbeit unserer Kooperationspartnerin findest du auf Instagram.', { href: 'https://www.instagram.com/lis.lito/', label: 'lis.lito auf Instagram' }),
          ],
        }, 'none'),
        section('designkooperation-lis-lito-weiterlesen', 'comondi-related', 'Weiterlesen', { subheading: 'Weiterlesen', heading: 'Weitere Perspektiven.', items: [teaser(articles.outdoor), teaser(articles.abschluss)] }),
        next('designkooperation-lis-lito-cta', 'Beratung und Gestaltung verbinden?', 'Erzählt uns von eurem Vorhaben. Je nach Aufgabe beziehen wir die passende Gestaltungsperspektive ein.', 'Lass uns sprechen', '/kontakt?thema=Designkooperation+lis.lito', []),
      ],
    },

    kontakt: {
      seo: seo('Kontakt – lasst uns über euer Vorhaben sprechen | co:mondi', 'Kontaktiert Eva Lohmüller und Sebastian Kunerl bei co:mondi. Unternehmensberatung für Projekte, agile Transformation und Veränderung. München und Stuttgart.'),
      sections: [
        section('anfrage', 'comondi-contact', 'Kontakt', {
          subheading: 'Kontakt',
          heading: 'Lasst uns sprechen.',
          text: 'Erzählt uns kurz, was euch beschäftigt. Gemeinsam klären wir, wie wir euch unterstützen können.',
          attribution: 'Lieber direkt? Eure Ansprechpersonen',
          form: {
            nameLabel: 'Dein Name', subjectLabel: 'Thema', messageLabel: 'Deine Nachricht',
            messagePlaceholder: 'Was möchtet ihr verändern? Erzählt uns kurz von eurem Vorhaben.',
            submitLabel: 'Nachricht senden', successHeading: 'Danke für deine Nachricht.',
            successText: 'Deine Anfrage ist bei uns angekommen. Wir melden uns bei dir.',
            helpText: 'Mit * gekennzeichnete Felder sind erforderlich.',
          },
          items: structuredClone(people),
        }, 'none'),
        section('nach-dem-absenden', 'comondi-after', 'Nach dem Absenden', {
          subheading: 'Nach dem Absenden',
          heading: 'Was nach eurer Nachricht passiert.',
          items: [
            item('angekommen', 'Eure Nachricht kommt an', 'Eure Anfrage landet in unserem geschützten Posteingang. Im Formular seht ihr sofort, dass sie angekommen ist.', { meta: 'Gesendet' }),
            item('antwort', 'Wir melden uns persönlich', 'Wir lesen eure Nachricht und melden uns persönlich bei euch.', { meta: 'Persönlich' }),
            item('gespraech', 'Erstes Gespräch', 'Wir sprechen über eure Situation, klären Erwartungen und lernen euer Umfeld kennen.', { meta: 'Kennenlernen' }),
            item('einschaetzung', 'Ehrliche Einschätzung', 'Gemeinsam prüfen wir, ob unsere Kompetenzen und Ressourcen zu eurem Vorhaben passen, und besprechen den nächsten sinnvollen Schritt.', { meta: 'Nächster Schritt' }),
          ],
        }),
      ],
    },
  };
}
