import { z } from 'zod';

// German default messages for every schema. Explicit messages in a schema still take precedence.
z.config(z.locales.de());
z.config({ customError: issue => {
  if (issue.code === 'too_big') return issue.origin === 'string' ? `Bitte höchstens ${issue.maximum} Zeichen verwenden.` : issue.origin === 'array' ? `Bitte höchstens ${issue.maximum} Einträge anlegen.` : undefined;
  if (issue.code === 'too_small') return issue.origin === 'string' ? (Number(issue.minimum) <= 1 ? 'Bitte füllen Sie dieses Feld aus.' : `Bitte mindestens ${issue.minimum} Zeichen verwenden.`) : issue.origin === 'array' ? `Bitte mindestens ${issue.minimum} Einträge anlegen.` : undefined;
  if (issue.code === 'invalid_format') return issue.format === 'email' ? 'Bitte geben Sie eine gültige E-Mail-Adresse an.' : issue.format === 'url' ? 'Bitte geben Sie eine vollständige Adresse an.' : 'Das Format dieser Angabe ist nicht gültig.';
  return undefined;
} });

const fieldLabels: Record<string, string> = {
  heading: 'Überschrift', subheading: 'Dachzeile', text: 'Text', title: 'Titel', label: 'Beschriftung', meta: 'Zusatzangabe',
  href: 'Linkziel', primaryLabel: 'Erste Schaltfläche', primaryHref: 'Linkziel der ersten Schaltfläche',
  secondaryLabel: 'Zweite Schaltfläche', secondaryHref: 'Linkziel der zweiten Schaltfläche', caption: 'Bildunterschrift',
  quote: 'Zitat', attribution: 'Zusatzzeile', alt: 'Bildbeschreibung', src: 'Bildadresse', email: 'E-Mail-Adresse', phone: 'Telefonnummer',
  description: 'Beschreibung', slug: 'Seitenadresse', anchor: 'Sprungmarke', name: 'Name', tagline: 'Leitsatz', address: 'Adresse',
  city: 'Ort', postalCode: 'Postleitzahl', legalName: 'Firmenname', footerText: 'Fußzeilentext', siteUrl: 'Website-Adresse',
  host: 'SMTP-Server', from: 'Absenderadresse', to: 'Empfängeradresse', user: 'SMTP-Benutzername', retentionDays: 'Aufbewahrungsfrist', note: 'Notiz',
};
const counted: Record<string, string> = { pages: 'Seite', sections: 'Abschnitt', items: 'Eintrag', navigation: 'Navigationspunkt', columns: 'Spalte', links: 'Link', posts: 'Beitrag' };

/** Names the affected CMS field for a validation issue, e.g. "Seite 3 · Abschnitt 2 · Überschrift". */
export function issueLocation(path: readonly PropertyKey[]): string {
  const parts: string[] = [];
  for (let index = 0; index < path.length; index++) {
    const key = path[index], position = path[index + 1];
    if (typeof key === 'string' && key in counted && typeof position === 'number') { parts.push(`${counted[key]} ${position + 1}`); index++; }
    else if (key === 'seo') parts.push('Suchmaschinen');
    else if (key === 'image') parts.push('Bild');
  }
  const field = path.at(-1);
  if (typeof field === 'string' && field in fieldLabels) parts.push(fieldLabels[field]);
  return parts.join(' · ');
}
