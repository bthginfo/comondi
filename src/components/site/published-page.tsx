import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth';
import { consentLegalLinks, consentScriptDefinitionKey, publicConsentScriptPage } from '@/lib/consent/model';
import { digest } from '@/lib/security';
import { analyticsPrivacy } from '@/lib/analytics/model';
import { resolvePage } from '@/lib/blog';
import { alternateShopPage } from '@/lib/commerce/route-pages';
import { hideInactiveCommerceLinks } from '@/lib/commerce/pages';
import { hasBilingualHomepage, languageForSlug, languageSwitchSlugs } from "@/lib/site-languages";
import { publishedContent, publicPageSnapshot } from '@/lib/content';
import { clubTimelineItems } from '@/lib/club/fixtures';
import { publicClubFixtures } from '@/lib/club/public-fixtures';
import { pageMetadata } from '@/lib/metadata';
import { createSection } from '@/lib/section-library';
import { analytics } from '@/lib/server/analytics/store';
import { newsletter } from '@/lib/server/newsletter/store';
import { StructuredData } from '@/components/structured-data';
import { PublicSiteView } from './public-site-view';
import { DocumentLanguage } from './document-language';

async function publishedRoute(path: string, query?: string) {
  const index = await publishedContent();
  const germanHomeAlias = path === 'de' && !index.pages.some(page => page.slug === 'de');
  const slug = germanHomeAlias ? '' : path;
  // Unknown addresses are answered from the shared published index, so probes for random URLs
  // never query the database or add an entry to the page cache.
  if (!resolvePage(index, slug, query)) return null;
  return { ...await publicPageSnapshot(slug), index, slug, germanHomeAlias };
}

export async function publishedPageMetadata(path: string) {
  const route = await publishedRoute(path);
  if (!route) return {};
  const { content, siteUrl, index, slug } = route;
  const page = resolvePage(content, slug);
  if (!page) return {};
  const alternate = alternateShopPage(page, index);
  return pageMetadata(page, content, siteUrl, alternate ? [...index.pages, page, alternate] : index.pages);
}

export async function PublishedPage({ path, query }: { path: string; query?: string }) {
  const route = await publishedRoute(path, query);
  if (!route) notFound();
  const { content, siteUrl, cartHref, index, slug, germanHomeAlias } = route;
  const bilingual = hasBilingualHomepage(index.pages);
  if (germanHomeAlias && !bilingual) redirect('/');
  const page = resolvePage(content, slug, query);
  if (!page) notFound();
  const club = content.config.modules?.clubManagement;
  const hasFixtures = club?.enabled && page.sections.some(section => section.type === 'timeline' && section.visible && section.content.clubFixtures);
  const fixtures = hasFixtures ? await publicClubFixtures() : undefined;
  const language = languageForSlug(page.slug);
  const sections = page.sections.map(section => fixtures && section.type === 'timeline' && section.content.clubFixtures
    ? { ...section, content: { ...section.content, items: clubTimelineItems(fixtures, section.content.clubFixtures, language, Date.now(), club?.timeZone) } } : section);
  const post = content.posts?.find(post => page.id === 'post-' + post.id);
  const { scripts = [], ...banner } = content.config.consent;
  const tracking = publicConsentScriptPage(page);
  // The public statistics settings are rendered with the page instead of being requested on every visit.
  // Changing them revalidates all pages (api/admin/analytics); measurement itself still starts only after consent.
  const statistics = tracking || page.slug === 'datenschutz' ? await analytics.publicConfig() : undefined;
  if (page.slug === 'datenschutz') {
    const disclosures = await Promise.all([analyticsPrivacy(statistics!), newsletter.disclosure()]);
    for (const [index, anchor] of ['webstatistik', 'newsletter'].entries()) {
      const disclosure = disclosures[index];
      if (disclosure) sections.push({
        ...createSection('richtext'), id: anchor + '-privacy', anchor,
        content: { heading: disclosure.title, text: disclosure.paragraphs.join('\n\n') }
      });
    }
  }
  const enabled = tracking && banner.enabled ? scripts.filter(script => script.enabled) : [];
  // Page-context code runs with this document's origin. Keep it out of signed-in CMS sessions.
  const cmsSession = enabled.some(script => script.context === 'page') && (await cookies()).has(SESSION_COOKIE);
  const items = cmsSession ? enabled.filter(script => script.context === 'sandbox') : enabled;
  const consent = {
    tracking,
    analytics: tracking ? statistics : undefined,
    legalLinks: consentLegalLinks(content.config, language, index.pages),
    scripts: items.length ? { items, generation: digest(consentScriptDefinitionKey(items)) } : undefined,
  };
  const site = { ...hideInactiveCommerceLinks(content.config, index.pages), consent: banner };
  const alternate = alternateShopPage(page, index);
  const switchPages = alternate ? [...index.pages, page, alternate] : index.pages;
  return <>
    {language !== 'de' && <DocumentLanguage lang={language} />}
    <StructuredData page={page} site={content.config} base={siteUrl} post={post} bilingual={bilingual} />
    <PublicSiteView cartHref={cartHref} page={{...page,sections}} site={site} consent={consent} translations={languageSwitchSlugs(page, switchPages)} />
  </>;
}
