"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import type { ContentItem, SectionContent } from "@/lib/types";
import { comondiMotion } from "@/lib/comondi-motion";
import { ContentLink, EditableChoice, EditableImage, EditableText } from "../editable";
import { SectionHeadingProvider, useSectionHeadingLevel } from "../heading-level";
import { ContactForm } from "../contact-form";
import { consentEvent } from "../consent";
import type { VariantSectionProps, VariantSiteProps } from "../variants/types";
import { ComondiNavigation } from "./comondi-navigation";
import { ProcessExplorer, WorldExplorer, worldIndex } from "./comondi-explorers";
import { PlanetScene } from "./planet-scene";
import { HeroJourney, type JourneyWorld } from "./hero-journey";
import { maxJourneyWorlds } from "@/lib/comondi-journey";
import { SpaceBackground } from "./space-background";
import { installComondiMotion } from "./motion-runtime";
import { AtlasMap } from "./atlas-map";
import { atlasDisplay, atlasText } from "./atlas-fonts";
import { DesignSwitch, designReview, useComondiDesign } from "./design-switch";
import type { ComondiDesign } from "@/lib/types";
import { styles } from "./styles";

export function ComondiSite({ page, site, editable, selectedSectionId, onSectionSelect, onSectionChange, fallback }: VariantSiteProps) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const settings = useMemo(() => comondiMotion(site.comondiMotion), [site.comondiMotion]);
  const [design, setDesign] = useComondiDesign(settings.design, editable);
  const atlas = design === "atlas";
  useEffect(() => {
    try { setPaused(sessionStorage.getItem("comondi-space-paused") === "1"); } catch {}
  }, []);
  useEffect(() => {
    if (!editable && root.current) return installComondiMotion(root.current, settings);
  }, [editable, page.id, settings]);
  const toggleMotion = () => {
    setPaused(!paused);
    try { sessionStorage.setItem("comondi-space-paused", paused ? "0" : "1"); } catch {}
  };
  const palette = site.theme.palettes?.[site.designVariant || 1];
  const style = {
    "--cm-space-visibility": String(0.3 + settings.intensity / 100),
    "--cm-nebula-duration": `${95 - settings.speed * 0.55}s`,
    "--cm-background": palette?.background || site.theme.background,
    "--cm-global-accent": palette?.accent || site.theme.accent,
    "--cm-global-text": palette?.text || "#f2f3f8",
    "--cm-base-surface": palette?.surface || "#131b2f",
    "--cm-base-border": palette?.border || "#263048",
    "--cm-site-radius": `${site.theme.radius}px`,
    "--cm-font": site.theme.font === "dm-sans" ? "'DM Sans Variable', sans-serif" : "'Manrope Variable', sans-serif",
  } as CSSProperties;
  const Main = editable ? "div" : "main";
  const footer = site.footer;
  const footerLinks = footer?.columns.length ? footer.columns.flatMap(column => column.links) : site.navigation;
  const year = new Date().getFullYear();
  const copyright = (footer?.copyright || "© {year} {name}").replaceAll("{year}", String(year)).replaceAll("{name}", site.legalName);
  const parent = site.navigation.find(link => link.href !== "/" && `/${page.slug}`.startsWith(`${link.href}/`));
  const pageType = page.slug.startsWith("leistungen/") ? "service" : page.slug.startsWith("aktuelles/") ? "article" : page.slug || "home";
  const sections = page.sections.filter(section => section.visible || editable);
  const firstSectionId = sections[0]?.id;
  // The Atlas map places the page's service worlds as pins around the opening.
  const worldPins = (sections.find(section => section.type === "comondi-worlds")?.content.items ?? []).filter(entry => entry.href).map(entry => ({ id: entry.id, title: entry.title, href: entry.href }));
  // The Kosmos opening travels through the same service worlds, each with the planet it has in the explorer.
  const worldsSection = sections.find(section => section.type === "comondi-worlds");
  const journeyWorlds = useMemo<JourneyWorld[]>(() => (worldsSection?.content.items ?? [])
    .map((entry, index) => ({ id: entry.id, title: entry.title?.trim(), meta: entry.meta, text: entry.text, href: entry.href, planet: worldIndex(entry, index) }))
    .filter(world => world.title).slice(0, maxJourneyWorlds), [worldsSection?.content.items]);

  return <div id="seitenanfang" ref={root} className={`${styles.site}${atlas ? ` ${atlasDisplay.variable} ${atlasText.variable}` : ""}`} style={style} data-cm-page={pageType} data-cm-design={design}
    data-cm-motion={settings.enabled && !editable ? "on" : "off"}
    data-cm-feedback={settings.enabled && settings.interactionFeedback && !editable ? "on" : "off"}
    data-cm-editable={editable ? "true" : undefined}>
    {!atlas && <SpaceBackground settings={settings} paused={paused} editable={editable} />}
    {!editable && designReview && <DesignSwitch design={design} onChange={setDesign} />}
    <ComondiNavigation site={site} slug={page.slug} editable={editable} motionEnabled={settings.enabled} paused={paused} onToggleMotion={toggleMotion} />
    <Main id="hauptinhalt" tabIndex={editable ? undefined : -1} data-site-main={editable ? "" : undefined}>
      {parent && <nav aria-label="Übergeordnete Seite" className={styles.backNav}>
        <ContentLink href={parent.href} editable={editable} className={styles.textLink}><ArrowLeft size={17} aria-hidden="true" /> {parent.label}</ContentLink>
      </nav>}
      {sections.map(section => section.type.startsWith("comondi-") ? <SectionHeadingProvider key={`${page.id}-${section.id}`} sectionId={section.id}>
        <ComondiSection ambientPaused={paused} design={design} worldPins={worldPins} journeyWorlds={journeyWorlds} section={section} site={site} editable={editable} selected={selectedSectionId === section.id}
          onSelect={() => onSectionSelect?.(section.id)} onChange={onSectionChange}
          pageId={page.id} hideSecondary={parent?.href === section.content.secondaryHref && firstSectionId === section.id} />
      </SectionHeadingProvider> : fallback(section))}
    </Main>
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <ContentLink editable={editable} href="/" className={styles.brand}><img src="/comondi/logo.svg" width="140" height="50" alt={site.name} /></ContentLink>
          <p>{footer?.brandText || site.tagline}</p>
        </div>
        <div className={styles.footerLinks}>
          {footerLinks.map((link,index) => <ContentLink key={`${link.href}-${index}`} editable={editable} href={link.href}>{link.label}</ContentLink>)}
        </div>
        <div className={styles.footerContact}>
          {footer?.showContact !== false && <ContentLink editable={editable} href={`mailto:${site.email}`}>{site.email} <ArrowUpRight size={16} aria-hidden="true" /></ContentLink>}
          {footer?.showAddress !== false && <address>{site.address}<br />{site.postalCode} {site.city}</address>}
          {site.footerText && <span>{site.footerText}</span>}
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>{copyright}</span>
        <div>
          {(footer?.legalLinks || [{ label: "Impressum", href: "/impressum" }, { label: "Datenschutz", href: "/datenschutz" }]).map(link =>
            <ContentLink key={link.href} editable={editable} href={link.href}>{link.label}</ContentLink>)}
          {!editable && site.consent.enabled && footer?.showCookieSettings !== false && <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(consentEvent))}>Datenschutzeinstellungen</button>}
          {!editable && settings.enabled && <button type="button" data-motion-control="" onClick={toggleMotion}>{paused ? "Bewegung fortsetzen" : "Bewegung pausieren"}</button>}
        </div>
        {footer?.showBackToTop !== false && <ContentLink editable={editable} href="#seitenanfang" className={styles.topLink}>Nach oben <ArrowUp size={15} aria-hidden="true" /></ContentLink>}
      </div>
    </footer>
  </div>;
}

export function ComondiSection({ section, site, editable = false, selected, onSelect, onChange, ambientPaused = false, pageId, hideSecondary, design = "kosmos", worldPins = [], journeyWorlds = [] }: VariantSectionProps & {
  ambientPaused?: boolean; pageId?: string; hideSecondary?: boolean; design?: ComondiDesign; worldPins?: { id: string; title: string; href?: string }[];
  journeyWorlds?: JourneyWorld[];
}) {
  const { content: c, design: d } = section;
  const level = useSectionHeadingLevel(section.id);
  const [openFaq, setOpenFaq] = useState<string>();
  const uid = useId();
  const settings = comondiMotion(site.comondiMotion);
  const items = c.items || [];
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) =>
    update("items", items.map((entry, i) => i === index ? { ...entry, [key]: value } : entry));
  const text = (key: "heading" | "subheading" | "text" | "caption" | "quote" | "attribution", as: "h1" | "h2" | "p" | "span" = "p", className = "") =>
    <EditableText value={c[key]} as={key === "heading" ? level : as} editable={editable} onChange={value => update(key, value)} className={className} />;
  const itemText = (entry: ContentItem, index: number, key: "title" | "text" | "label" | "meta" | "email" | "phone", as: "h3" | "p" | "span" = "p", className = "") =>
    <EditableText value={entry[key]} as={as} editable={editable} onChange={value => updateItem(index, key, value)} className={className} />;
  const action = (secondary = false) => {
    const field = secondary ? "secondaryLabel" : "primaryLabel";
    const href = secondary ? "secondaryHref" : "primaryHref";
    if (!c[field] && !editable || secondary && hideSecondary && !editable) return null;
    return <ContentLink href={c[href]} editable={editable} editField={href} className={secondary ? `${styles.outlineButton} ws-text-button` : `${styles.button} ws-button-primary`}>
      <EditableText value={c[field]} as="span" editable={editable} onChange={value => update(field, value)} />
      {secondary ? <ArrowRight size={18} aria-hidden="true" /> : <ArrowUpRight size={19} aria-hidden="true" />}
    </ContentLink>;
  };
  const intro = () => <div className={styles.intro}>
    <div>{text("subheading", "span", styles.eyebrow)}{text("heading", "h2")}</div>
    {text("text", "p", styles.introText)}
  </div>;
  const extras = () => c.caption || c.secondaryLabel || c.primaryLabel ? <div className={styles.sectionFoot}>
    {text("caption", "p")}
    <div className={styles.actions}>{action()}{action(true)}</div>
  </div> : null;
  const email = (entry: ContentItem, i: number) => (entry.email || editable) && <ContentLink editable={editable} href={`mailto:${entry.email || ""}`} className={styles.personLink}>
    <Mail size={17} aria-hidden="true" />{itemText(entry, i, "email", "span")}
  </ContentLink>;
  const phone = (entry: ContentItem, i: number) => (entry.phone || editable) && <ContentLink editable={editable} href={`tel:${entry.phone?.replace(/[^+\d]/g, "") || ""}`} className={styles.personLink}>
    <Phone size={17} aria-hidden="true" />{itemText(entry, i, "phone", "span")}
  </ContentLink>;
  const portrait = (entry: ContentItem, i: number) => entry.image || editable ?
    <EditableImage image={entry.image} editable={editable} className={styles.portrait} onChange={value => updateItem(i, "image", value)} /> :
    <span className={styles.initials} aria-hidden="true">{entry.title.split(/\s+/).slice(0,2).map(name => name[0]).join("")}</span>;
  const wrapStyle = {
    "--cm-section-ink": d.textColor || "var(--cm-global-text)",
    "--cm-section-muted": d.textColor ? `color-mix(in srgb, ${d.textColor} 78%, transparent)` : "var(--cm-muted)",
    "--cm-accent": d.accentColor || "var(--cm-global-accent)",
    "--cm-section-radius": `${d.radius}px`,
    "--cm-scale": d.fontScale,
    "--cm-columns": Math.min(d.columns, Math.max(items.length,1)),
    "--cm-panel": d.cardBackground || "var(--cm-surface)",
    ...(d.background ? { backgroundColor: d.background } : {}),
    ...(d.buttonBackground ? { "--cm-button-fill": d.buttonBackground } : {}),
    ...(d.buttonTextColor ? { "--cm-button-text": d.buttonTextColor } : {}),
  } as CSSProperties;
  const explorer = { items, editable, editItem: updateItem, feedback: settings.enabled && settings.interactionFeedback };

  let content;
  switch (section.type) {
    case "comondi-hero": {
      const hintIndex = items.findIndex(entry => entry.id === "planet-interaction-hint");
      const hint = items[hintIndex];
      const related = items.map((entry,index) => ({ entry,index })).filter(({entry}) => entry.id !== "planet-interaction-hint" && entry.href);
      const copy = <>
        {text("subheading", "span", styles.eyebrow)}
        {text("heading", "h1", styles.heroHeading)}
        {text("text", "p", styles.heroText)}
        <div className={styles.actions}>{action()}{action(true)}</div>
        {c.caption && <div className={styles.heroLocation}><MapPin size={16} aria-hidden="true" />{text("caption", "span")}</div>}
        {related.length > 0 && <div className={styles.heroRelated}>{related.map(({entry,index}) => <ContentLink key={entry.id} href={entry.href} editable={editable} editField="href" editItemId={entry.id} className={styles.textLink}>
          {itemText(entry,index,"title","span")}<ArrowUpRight size={15} aria-hidden="true" />
        </ContentLink>)}</div>}
      </>;
      const down = c.attribution && <ContentLink editable={editable} href={c.secondaryHref} editField="secondaryHref" className={styles.heroDown}>
        <ArrowDown size={19} aria-hidden="true" />{text("attribution", "span")}
      </ContentLink>;
      const quote = c.quote && text("quote", "p", styles.heroQuote);
      const staticHero = <div className={styles.heroInner}>
        <div className={styles.heroCopy}>{copy}</div>
        <div className={styles.heroVisual}>
          <div className={styles.heroGlow} aria-hidden="true" />
          {design === "atlas" ? <AtlasMap editable={editable} label={c.image?.alt} links={related.length ? related.map(({ entry }) => ({ id: entry.id, title: entry.title, href: entry.href })) : worldPins} /> : editable ? <div className={styles.sceneEdit}>
            <EditableImage image={c.image} editable priority className={styles.sceneEditImage} onChange={value => update("image",value)} />
            {hint && <div className={styles.heroEditHint} data-item-id={hint.id}>{itemText(hint,hintIndex,"title","span")}{itemText(hint,hintIndex,"text")}</div>}
          </div> : <PlanetScene motionSettings={settings} poster={c.image?.src} label={c.image?.alt}
            ambientPaused={ambientPaused} interactionHint={hint?.title} desktopHint={hint?.text} />}
        </div>
        {down}
        {quote}
      </div>;
      // Kosmos opening as a scroll journey through the service worlds of this page. The CMS canvas,
      // Atlas, disabled motion and pages without the worlds section keep the static opening.
      const journey = design === "kosmos" && !editable && journeyWorlds.length > 0 && settings.enabled && settings.heroJourney !== false;
      content = journey ? <HeroJourney sectionId={section.id} worlds={journeyWorlds} paused={ambientPaused} headingLevel={level === "h1" ? "h2" : "h3"} staticHero={staticHero}
        copy={<>{copy}{down}{quote}</>}
        scene={handle => <PlanetScene journey={handle} motionSettings={settings} poster={c.image?.src} label={c.image?.alt}
          ambientPaused={ambientPaused} interactionHint={hint?.title} desktopHint={hint?.text} />} /> : staticHero;
      break;
    }
    case "comondi-proof":
      content = <div className={styles.proofInner}>
        {text("heading", "h2")}
        <ul>{items.map((entry,i) => <li key={entry.id} data-item-id={entry.id}>{itemText(entry,i,"title","span")}</li>)}</ul>
      </div>;
      break;
    case "comondi-worlds":
      content = <div className={styles.sectionInner}>{intro()}<WorldExplorer {...explorer} storageKey={`comondi-world:${pageId || "page"}:${section.id}`} />{extras()}</div>;
      break;
    case "comondi-process":
      content = <div className={styles.sectionInner}>{intro()}<ProcessExplorer {...explorer} />{extras()}</div>;
      break;
    case "comondi-intro":
    case "comondi-culture":
      content = <div className={styles.sectionInner}>{intro()}
        <div className={styles.principles}>{items.map((entry,i) => <article key={entry.id} data-item-id={entry.id} data-cm-tilt="">
          {itemText(entry,i,"title","h3")}{itemText(entry,i,"text")}
          {entry.href && <ContentLink href={entry.href} editable={editable} editField="href" editItemId={entry.id} className={styles.textLink}>
            {itemText(entry,i,"label","span")}<ArrowUpRight size={17} aria-hidden="true" />
          </ContentLink>}
        </article>)}</div>{extras()}
      </div>;
      break;
    case "comondi-cta":
      content = <div className={styles.sectionInner}><div className={styles.ctaPanel}>
        <div>{text("subheading", "span", styles.eyebrow)}{text("heading", "h2")}{text("text")}</div>
        <div className={styles.actions}>{action()}{action(true)}</div>
      </div></div>;
      break;
    case "comondi-inner":
      content = <div className={styles.innerWrap}>
        <div>{text("subheading", "span", styles.eyebrow)}{text("heading", "h1", styles.innerTitle)}{text("text", "p", styles.innerText)}
          {(c.primaryLabel || c.secondaryLabel && !hideSecondary || editable) && <div className={styles.actions}>{action()}{action(true)}</div>}
        </div>
        {c.image && <EditableImage image={c.image} editable={editable} className={styles.innerImage} priority={level === "h1"} onChange={value => update("image",value)} />}
      </div>;
      break;
    case "comondi-team":
      content = <div className={styles.sectionInner}>{intro()}<div className={styles.teamGrid}>
        {items.map((entry,i) => <article key={entry.id} data-item-id={entry.id} className={styles.personCard}>
          <div className={styles.personHead}><div className={styles.personArt}>{portrait(entry,i)}</div>
            <div>{itemText(entry,i,"label","span",styles.eyebrow)}{itemText(entry,i,"title","h3")}{itemText(entry,i,"text")}</div>
          </div>
          <div className={styles.personLinks}>{email(entry,i)}{phone(entry,i)}</div>
        </article>)}
      </div>{extras()}</div>;
      break;
    case "comondi-contact":
      content = <div className={styles.sectionInner}><div className={styles.contactGrid}>
        <div className={styles.contactIntro}>
          {text("subheading", "span", styles.eyebrow)}{text("heading", "h2")}{text("text")}
        </div>
        <div className={styles.formCard}><ContactForm editable={editable} informal compact copy={c.form} /></div>
        <div className={styles.contactDetails}>
          <ContentLink editable={editable} href={`mailto:${site.email}`} className={styles.contactEmail}><Mail size={20} aria-hidden="true" />{site.email}<ArrowUpRight size={18} aria-hidden="true" /></ContentLink>
          <address className={styles.contactAddress}><MapPin size={20} aria-hidden="true" /><span>{site.address}<br />{site.postalCode} {site.city}</span></address>
          <div className={styles.contactPeople}>{items.map((entry,i) => <article key={entry.id} data-item-id={entry.id} className={styles.contactPerson}>
            <div className={styles.contactPortrait}>{portrait(entry,i)}</div>
            <div>{itemText(entry,i,"title","h3")}{email(entry,i)}{phone(entry,i)}</div>
          </article>)}</div>
        </div>
      </div></div>;
      break;
    case "comondi-faq":
      content = <div className={styles.sectionInner}><div className={styles.faqGrid}>
        <div>{text("subheading", "span", styles.eyebrow)}{text("heading", "h2")}{text("text")}</div>
        <div className={styles.faqList}>{items.map((entry,i) => {
          const expanded = editable || entry.id === openFaq;
          return <div key={entry.id} data-item-id={entry.id} className={styles.faq} data-expanded={expanded}>
            <EditableChoice editable={editable} type="button" aria-expanded={expanded} aria-controls={`${uid}-faq-${i}`} className={styles.faqQuestion}
              onChoose={() => setOpenFaq(expanded ? undefined : entry.id)}>
              {itemText(entry,i,"title","span")}<ChevronDown size={20} aria-hidden="true" />
            </EditableChoice>
            <div id={`${uid}-faq-${i}`} className={styles.faqAnswer} aria-hidden={!expanded || undefined} inert={!expanded}><div>{itemText(entry,i,"text")}</div></div>
          </div>;
        })}</div>
      </div></div>;
      break;
    case "comondi-articles":
      content = <div className={styles.sectionInner}>{intro()}<div className={styles.articleGrid}>
        {items.map((entry,i) => <article key={entry.id} data-item-id={entry.id} data-cm-tilt="" className={styles.articleCard} data-world={(i+1)%4}>
          <div className={styles.articleArt}>{entry.image || editable ? <EditableImage image={entry.image} editable={editable} className={styles.articleImage} onChange={value => updateItem(i,"image",value)} /> : <div className={styles.worldPlanet} aria-hidden="true" />}</div>
          <div className={styles.articleCopy}>{itemText(entry,i,"meta","span",styles.eyebrow)}
            <ContentLink href={entry.href} editable={editable} editField="href" editItemId={entry.id} className={styles.articleTitle}>
              {itemText(entry,i,"title","h3")}<ArrowUpRight size={22} aria-hidden="true" />
            </ContentLink>{itemText(entry,i,"text")}
          </div>
        </article>)}
      </div></div>;
      break;
    case "comondi-legal":
      content = <div className={styles.sectionInner}><div className={styles.legal}>
        {text("heading", "h2")}{text("text")}
        <div className={styles.legalItems}>{items.map((entry,i) => <article key={entry.id} data-item-id={entry.id}>
          {itemText(entry,i,"title","h3")}{itemText(entry,i,"text")}
          {entry.href && <ContentLink href={entry.href} editable={editable} editField="href" editItemId={entry.id} className={styles.textLink}>
            {entry.label ? itemText(entry,i,"label","span") : entry.href}<ArrowUpRight size={17} aria-hidden="true" />
          </ContentLink>}
        </article>)}</div>
      </div></div>;
      break;
    default:
      return null;
  }

  return <section id={section.anchor || section.id} data-section-id={section.id} data-section={section.id} data-section-type={section.type}
    data-cm-entrance={d.animation} data-cm-spacing={d.spacing} data-cm-width={d.width} data-cm-align={d.align}
    className={`${styles.section} ${selected ? "ws-section-selected" : ""} ${!section.visible ? "ws-section-hidden" : ""}`} style={wrapStyle}
    onClick={editable ? onSelect : undefined} onFocusCapture={editable ? onSelect : undefined}>
    {section.type === "comondi-worlds" && section.anchor === "welten" && <span id="topics" className={styles.anchorAlias} aria-hidden="true" />}
    {section.type === "comondi-culture" && section.anchor === "haltung" && <><span id="way-to-success" className={styles.anchorAlias} aria-hidden="true" /><span id="attitude-of-mind" className={styles.anchorAlias} aria-hidden="true" /></>}
    {section.type === "comondi-cta" && section.anchor === "naechster-schritt" && <span id="kontakt" className={styles.anchorAlias} aria-hidden="true" />}
    {content}
  </section>;
}
