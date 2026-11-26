import type { WebsiteContent } from "./types";

function contains(value: unknown, needle: string): boolean {
  if (typeof value === "string") return value.includes(needle);
  if (Array.isArray(value)) return value.some(entry => contains(entry, needle));
  if (value && typeof value === "object") return Object.values(value).some(entry => contains(entry, needle));
  return false;
}

/**
 * Human-readable places where a media file is used, e.g. "Startseite · Bildbühne".
 * Draft and published content are both checked; a published-only use is marked as such.
 * The server keeps the final check (it also knows retained versions and Social drafts).
 */
export function mediaUsage(url: string, draft: WebsiteContent, published?: WebsiteContent): string[] {
  if (!url) return [];
  const places: string[] = [];
  const seen = new Set<string>();
  const add = (label: string) => { if (!seen.has(label)) { seen.add(label); places.push(label); } };
  const scan = (content: WebsiteContent, suffix: string) => {
    for (const page of content.pages) {
      for (const section of page.sections) if (contains(section, url)) add(`${page.title} · ${section.name || section.content.heading || section.type}${suffix}`);
      if (contains(page.seo, url)) add(`${page.title} · Vorschaubild${suffix}`);
    }
    for (const post of content.posts ?? []) if (contains(post, url)) add(`Beitrag: ${post.title}${suffix}`);
    if (contains(content.config, url)) add(`Website-Einstellungen${suffix}`);
  };
  scan(draft, "");
  const draftPlaces = new Set(places);
  if (published) {
    const before = places.length;
    scan(published, " (veröffentlicht)");
    // A place already listed for the draft does not need a second, published-only entry.
    for (let index = places.length - 1; index >= before; index--) {
      if (draftPlaces.has(places[index].replace(/ \(veröffentlicht\)$/, ""))) places.splice(index, 1);
    }
  }
  return places;
}
