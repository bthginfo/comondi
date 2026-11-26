"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Flag, Mail, MessagesSquare, Phone, Send, Wrench } from "lucide-react";
import type { ComondiDesign, ContentItem, Section, SectionContent, SiteConfig } from "@/lib/types";
import { entryWorld, factLines, magazineTopics, planetWorld, questionsHref, worldForText } from "@/lib/comondi-sections";
import { ContentLink, EditableImage, EditableText } from "../editable";
import { AtlasPlanet } from "./atlas-planet";
import { styles } from "./styles";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
type TextKey = "heading" | "subheading" | "text" | "caption" | "quote" | "attribution";
type ItemKey = "title" | "text" | "label" | "meta" | "email" | "phone";

export interface ComondiPageSectionProps {
  section: Section;
  site: SiteConfig;
  editable: boolean;
  level: "h1" | "h2" | "h3" | "h4";
  design: ComondiDesign;
  /** Motion and interaction feedback are allowed by the CMS settings. */
  motion: boolean;
  onChange?: (section: Section) => void;
}

const pad = (value: number) => String(value).padStart(2, "0");
const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A service-world planet: a textured sphere in Kosmos, the engraved drawing in Atlas. */
export function Planet({ world, className = "" }: { world: number; className?: string }) {
  return <span className={`${styles.cmOrb} ${className}`} data-world={world} aria-hidden="true">
    <span className={styles.cmSphere} />
    <AtlasPlanet world={world} />
  </span>;
}

/** One phase of the moon; 0 is new, 1 is full. The lit side grows from the right. */
export function MoonPhase({ fraction, className = "" }: { fraction: number; className?: string }) {
  const f = Math.min(1, Math.max(0, fraction));
  const r = 20, cx = 24, cy = 24;
  const rx = (Math.abs(1 - 2 * f) * r).toFixed(2);
  const lit = f >= .995 ? `M${cx},${cy - r}A${r},${r} 0 1,1 ${cx},${cy + r}A${r},${r} 0 1,1 ${cx},${cy - r}Z`
    : `M${cx},${cy - r}A${r},${r} 0 0,1 ${cx},${cy + r}A${rx},${r} 0 0,${f > .5 ? 1 : 0} ${cx},${cy - r}Z`;
  return <svg viewBox="0 0 48 48" className={`${styles.moonPhase} ${className}`} aria-hidden="true" focusable="false">
    <circle cx={cx} cy={cy} r={r} className={styles.moonDark} />
    {f > .01 && <path d={lit} className={styles.moonLit} />}
    <circle cx={cx} cy={cy} r={r} className={styles.moonRim} />
  </svg>;
}

function useKit({ section, editable, level, onChange }: ComondiPageSectionProps) {
  const c = section.content;
  const items = c.items || [];
  const sub: Tag = level === "h1" ? "h2" : "h3";
  const minor: Tag = level === "h1" ? "h3" : "h4";
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) =>
    update("items", items.map((entry, i) => i === index ? { ...entry, [key]: value } : entry));
  const text = (key: TextKey, as: Tag = "p", className = "") =>
    <EditableText value={c[key]} as={key === "heading" ? level : as} editable={editable} onChange={value => update(key, value)} className={className} />;
  const itemText = (entry: ContentItem, index: number, key: ItemKey, as: Tag = "p", className = "") =>
    <EditableText value={entry[key]} as={as} editable={editable} onChange={value => updateItem(index, key, value)} className={className} />;
  const list = (entry: ContentItem, index: number, className: string, field: "details" | "tags" = "details", as: "li-span" | "p" = "li-span") => {
    const values = entry[field] || [];
    if (!values.length) return null;
    const edit = (position: number) => (value: string) => updateItem(index, field, values.map((old, i) => i === position ? value : old));
    if (as === "p") return <div className={className}>{values.map((value, position) => <EditableText key={position} value={value} as="p" editable={editable} onChange={edit(position)} />)}</div>;
    return <ul className={className}>{values.map((value, position) => <li key={position}><EditableText value={value} as="span" editable={editable} onChange={edit(position)} /></li>)}</ul>;
  };
  const action = (secondary = false) => {
    const field = secondary ? "secondaryLabel" : "primaryLabel";
    const href = secondary ? "secondaryHref" : "primaryHref";
    if (!c[field] && !editable) return null;
    return <ContentLink href={c[href]} editable={editable} editField={href} className={secondary ? `${styles.outlineButton} ws-text-button` : `${styles.button} ws-button-primary`}>
      <EditableText value={c[field]} as="span" editable={editable} onChange={value => update(field, value)} />
      {secondary ? <ArrowRight size={18} aria-hidden="true" /> : <ArrowUpRight size={19} aria-hidden="true" />}
    </ContentLink>;
  };
  const actions = (className = "") => (c.primaryLabel || c.secondaryLabel || editable) ? <div className={`${styles.actions} ${className}`}>{action()}{action(true)}</div> : null;
  const intro = () => <div className={styles.intro}>
    <div>{text("subheading", "span", styles.eyebrow)}{text("heading")}</div>
    {text("text", "p", styles.introText)}
  </div>;
  const itemLink = (entry: ContentItem, index: number, className: string) => (entry.href || editable) ?
    <ContentLink href={entry.href} editable={editable} editField="href" editItemId={entry.id} className={className}>
      {entry.label || editable ? itemText(entry, index, "label", "span") : <span>{entry.title}</span>}<ArrowUpRight size={17} aria-hidden="true" />
    </ContentLink> : null;
  const photo = (entry: ContentItem, index: number, className: string, sizes: string) => entry.image || editable ?
    <EditableImage image={entry.image} editable={editable} className={className} sizes={sizes} onChange={value => updateItem(index, "image", value)} /> :
    <span className={`${className} ${styles.pgInitials}`} aria-hidden="true">{entry.title.split(/\s+/).slice(0, 2).map(name => name[0]).join("")}</span>;
  const contact = (entry: ContentItem, index: number) => <>
    {(entry.email || editable) && <ContentLink editable={editable} href={`mailto:${entry.email || ""}`} className={styles.pgContact}><Mail size={16} aria-hidden="true" />{itemText(entry, index, "email", "span")}</ContentLink>}
    {(entry.phone || editable) && <ContentLink editable={editable} href={`tel:${entry.phone?.replace(/[^+\d]/g, "") || ""}`} className={styles.pgContact}><Phone size={16} aria-hidden="true" />{itemText(entry, index, "phone", "span")}</ContentLink>}
  </>;
  return { c, items, sub, minor, update, updateItem, text, itemText, list, action, actions, intro, itemLink, photo, contact };
}
type Kit = ReturnType<typeof useKit>;

/* /leistungen: the four worlds on one chart around the connection. */
function MapSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const four = k.items.length === 4;
  return <div className={styles.pgWrap}>
    <div className={styles.mapHead}>
      {k.text("subheading", "span", styles.eyebrow)}{k.text("heading", "p", styles.pgTitle)}{k.text("text", "p", styles.pgLead)}{k.actions()}
    </div>
    <div className={styles.mapChart} data-four={four || undefined}>
      <div className={styles.mapHub}>
        {four && <svg className={styles.mapRoutes} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <circle cx="100" cy="100" r="94.3" className={styles.mapOrbit} />
          <circle cx="100" cy="100" r="58" className={styles.mapOrbitNear} />
          {[[33.3, 33.3], [166.7, 33.3], [33.3, 166.7], [166.7, 166.7]].map(([x, y]) => <line key={`${x}-${y}`} x1="100" y1="100" x2={x} y2={y} className={styles.mapRoute} />)}
        </svg>}
        {(k.c.caption || props.editable) && <span className={styles.mapCore}><span className={styles.mapMark} aria-hidden="true" />{k.text("caption", "span", styles.mapCaption)}</span>}
      </div>
      <ol className={styles.mapWorlds}>{k.items.map((entry, index) => {
        const world = entryWorld(entry, index);
        return <li key={entry.id} data-item-id={entry.id} data-world={world} data-corner={index % 4} className={styles.mapWorld}>
          <Planet world={world} className={styles.mapPlanet} />
          <div className={styles.mapCopy}>
            {k.itemText(entry, index, "meta", "span", styles.eyebrow)}
            {k.itemText(entry, index, "title", k.sub, styles.mapName)}
            {k.itemText(entry, index, "text", "p", styles.mapWhen)}
            {k.list(entry, index, styles.mapParts)}
            {Boolean(entry.tags?.length) && <div className={styles.mapMethods}><Wrench size={15} aria-hidden="true" /><span className={styles.srOnly}>Methoden:</span>{k.list(entry, index, styles.mapMethodList, "tags")}</div>}
            {k.itemLink(entry, index, styles.mapLink)}
          </div>
        </li>;
      })}</ol>
    </div>
  </div>;
}

/* /leistungen: two worlds that meet in one question. */
function PairsSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  return <div className={styles.sectionInner}>
    {k.intro()}
    <ol className={styles.pairList}>{k.items.map((entry, index) => {
      const names = (entry.details || []).slice(0, 2);
      const a = worldForText(names[0]) ?? index % 4;
      const b = worldForText(names[1]) ?? (a + 1) % 4;
      return <li key={entry.id} data-item-id={entry.id} className={styles.pair}>
        <div className={styles.pairArt} aria-hidden="true">
          <span className={styles.pairA} data-world={a}><Planet world={a} /></span>
          <span className={styles.pairB} data-world={b}><Planet world={b} /></span>
          <span className={styles.pairLens} />
        </div>
        <div className={styles.pairQuestion}>
          {names.length > 0 && <p className={styles.pairNames}>{names.map((name, position) => <Fragment key={position}>
            {position > 0 && <span className={styles.pairPlus} aria-hidden="true">+</span>}
            <EditableText value={name} as="span" editable={props.editable} onChange={value => k.updateItem(index, "details", (entry.details || []).map((old, i) => i === position ? value : old))} />
          </Fragment>)}</p>}
          {k.itemText(entry, index, "title", k.sub)}
        </div>
        <div className={styles.pairAnswer}>{k.itemText(entry, index, "text")}{k.itemLink(entry, index, styles.textLink)}</div>
      </li>;
    })}</ol>
  </div>;
}

/* /leistungen: forms of support as orbits around the team. */
function FormatsSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const [active, setActive] = useState<number>();
  const rings = Math.max(k.items.length, 1);
  return <div className={styles.sectionInner}><div className={styles.formats}>
    <div className={styles.formatsCopy}>
      {k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text", "p", styles.introText)}
      <ol className={styles.formatList}>{k.items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} data-active={active === index || undefined}
        onPointerEnter={() => setActive(index)} onPointerLeave={() => setActive(undefined)}>
        <span className={styles.formatNo} aria-hidden="true">{index + 1}</span>
        <div>{k.itemText(entry, index, "meta", "span", styles.eyebrow)}{k.itemText(entry, index, "title", k.sub)}{k.itemText(entry, index, "text")}</div>
      </li>)}</ol>
      {k.text("caption", "p", styles.formatNote)}
    </div>
    <div className={styles.orbitField} style={{ "--rings": rings } as CSSProperties} data-active={active !== undefined || undefined}>
      {k.items.map((entry, index) => <span key={entry.id} className={styles.orbitRing} data-active={active === index || undefined} style={{ "--ring": index } as CSSProperties} aria-hidden="true">
        <span className={styles.orbitBody}><span>{index + 1}</span></span>
      </span>)}
      <span className={styles.orbitCore}><span className={styles.orbitCoreGlow} aria-hidden="true" />{k.text("attribution", "span")}</span>
    </div>
  </div></div>;
}

/* Service pages: the opening with the page's own planet and motif. */
function PlanetHero(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const planet = props.section.design.comondiPlanet ?? "jupiter";
  const world = planetWorld(planet);
  return <div className={styles.phero} data-planet={planet} data-world={world}>
    <div className={styles.pheroCopy}>
      {k.text("subheading", "span", styles.eyebrow)}{k.text("heading", "p", styles.pheroTitle)}{k.text("text", "p", styles.pgLead)}{k.actions()}
    </div>
    <div className={styles.pheroArt} aria-hidden="true">
      {planet === "jupiter" && <span className={styles.pheroBars}>{[62, 38, 80, 52, 70, 30].map((width, index) => <span key={index} style={{ "--w": `${width}%`, "--i": index } as CSSProperties} />)}</span>}
      {planet === "neptune" && <svg className={styles.pheroLoops} viewBox="0 0 400 400" focusable="false">
        {[150, 178, 196].map((r, index) => <circle key={r} cx="200" cy="200" r={r} className={styles.pheroLoop} style={{ "--i": index } as CSSProperties} />)}
        {[30, 150, 270].map(angle => <path key={angle} d="M0,-7L9,0L0,7" className={styles.pheroArrow} transform={`rotate(${angle} 200 200) translate(200 22) rotate(90)`} />)}
      </svg>}
      {planet === "saturn" && <svg className={styles.pheroRing} viewBox="0 0 1000 400" preserveAspectRatio="none" focusable="false">
        <ellipse cx="560" cy="210" rx="520" ry="120" className={styles.pheroRingLine} />
        <ellipse cx="560" cy="210" rx="470" ry="98" className={styles.pheroRingLine} />
      </svg>}
      <Planet world={world} className={styles.pheroPlanet} />
      {planet === "moon" && <span className={styles.pheroPhases}>{[.08, .3, .5, .72, 1].map(fraction => <MoonPhase key={fraction} fraction={fraction} />)}</span>}
    </div>
  </div>;
}

/* Service pages: starting points as questions to mark, plus the first step. */
function QuestionsSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const [chosen, setChosen] = useState<string[]>([]);
  const selected = k.items.filter(entry => chosen.includes(entry.id)).map(entry => entry.title);
  const href = props.editable ? k.c.primaryHref : questionsHref(k.c.primaryHref, selected);
  return <div className={styles.sectionInner}><div className={styles.qGrid}>
    <div className={styles.qMain}>
      {k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text", "p", styles.introText)}
      <ul className={styles.qList}>{k.items.map((entry, index) => {
        const on = chosen.includes(entry.id);
        return <li key={entry.id} data-item-id={entry.id}>
          {props.editable ? <div className={styles.qItem}><span className={styles.qBox} aria-hidden="true"><Check size={15} /></span>{k.itemText(entry, index, "title", "span", styles.qText)}</div>
            : <button type="button" className={styles.qItem} aria-pressed={on} onClick={() => setChosen(on ? chosen.filter(id => id !== entry.id) : [...chosen, entry.id])}>
              <span className={styles.qBox} aria-hidden="true"><Check size={15} /></span><span className={styles.qText}>{entry.title}</span>
            </button>}
          {k.itemText(entry, index, "text", "p", styles.qAnswer)}
        </li>;
      })}</ul>
    </div>
    <aside className={styles.qStart}>
      <span className={styles.qStartMark} aria-hidden="true"><Flag size={20} /></span>
      {k.text("attribution", "span", styles.eyebrow)}
      {k.text("quote", "p", styles.qStartText)}
      <p className={styles.qStatus} role="status">{!props.editable && selected.length ? `${selected.length} ${selected.length === 1 ? "Frage" : "Fragen"} markiert – sie stehen gleich in eurer Nachricht.` : ""}</p>
      {(props.editable || !selected.length) && k.text("caption", "p", styles.qHint)}
      {(k.c.primaryLabel || props.editable) && <ContentLink href={href} editable={props.editable} editField="primaryHref" className={`${styles.button} ws-button-primary`}>
        <EditableText value={k.c.primaryLabel} as="span" editable={props.editable} onChange={value => k.update("primaryLabel", value)} /><ArrowUpRight size={19} aria-hidden="true" />
      </ContentLink>}
    </aside>
  </div></div>;
}

/* Service pages: what co:mondi does, drawn in the motif of the page's planet. */
function ServiceWork(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const planet = props.section.design.comondiPlanet ?? "jupiter";
  const { items } = k;
  const block = (entry: ContentItem, index: number, mark?: ReactNode) => <>
    {mark}
    {k.itemText(entry, index, "meta", "span", styles.eyebrow)}
    {k.itemText(entry, index, "title", k.sub, styles.workTitle)}
    {k.itemText(entry, index, "text")}
    {k.list(entry, index, styles.workDetails)}
  </>;
  let diagram: ReactNode;
  if (planet === "saturn" && items.length > 2) {
    const last = items.length - 1;
    diagram = <div className={styles.bridge}>
      <svg className={styles.bridgeRing} viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <ellipse cx="500" cy="150" rx="492" ry="118" /><ellipse cx="500" cy="150" rx="440" ry="96" />
      </svg>
      <div className={styles.bridgeBank} data-side="left" data-item-id={items[0].id}>{block(items[0], 0)}</div>
      <div className={styles.bridgeSpan}>
        <Planet world={2} className={styles.bridgePlanet} />
        <ul className={styles.bridgeDeck}>{items.slice(1, last).map((entry, offset) => <li key={entry.id} data-item-id={entry.id}>{block(entry, offset + 1)}</li>)}</ul>
      </div>
      <div className={styles.bridgeBank} data-side="right" data-item-id={items[last].id}>{block(items[last], last)}</div>
    </div>;
  } else if (planet === "neptune") {
    diagram = <div className={styles.cycle} data-four={items.length === 4 || undefined}>
      <div className={styles.cycleRing}>
        <svg viewBox="0 0 300 300" aria-hidden="true" focusable="false">
          <circle cx="150" cy="150" r="128" className={styles.cycleTrack} />
          <circle cx="150" cy="150" r="128" className={styles.cycleFlow} pathLength={1} />
          {Array.from({ length: Math.max(items.length, 1) }, (_, index) => <path key={index} d="M-8,-8L4,0L-8,8" className={styles.cycleArrow}
            transform={`rotate(${(index + .5) * 360 / Math.max(items.length, 1) - 90} 150 150) translate(278 150) rotate(90)`} />)}
        </svg>
        <Planet world={1} className={styles.cyclePlanet} />
        {(k.c.attribution || props.editable) && k.text("attribution", "span", styles.cycleCore)}
      </div>
      <ol className={styles.cycleSteps}>{items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} data-slot={index}>
        {block(entry, index, <span className={styles.cycleNo} aria-hidden="true">{index + 1}</span>)}
      </li>)}</ol>
    </div>;
  } else if (planet === "moon") {
    diagram = <ol className={styles.phaseList} style={{ "--count": items.length } as CSSProperties}>{items.map((entry, index) => <li key={entry.id} data-item-id={entry.id}>
      {block(entry, index, <span className={styles.phaseMark}><MoonPhase fraction={(index + 1) / items.length} /><span className={styles.phaseNo}>{pad(index + 1)}</span></span>)}
    </li>)}</ol>;
  } else {
    diagram = <div className={styles.tree}>
      {(k.c.attribution || props.editable) && <div className={styles.treeRoot}>{k.text("attribution", "span")}</div>}
      <ol className={styles.treeBranches} style={{ "--count": items.length } as CSSProperties}>{items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} className={styles.treeBranch} style={{ "--branch": `"${index + 1}"` } as CSSProperties}>
        {block(entry, index, <span className={styles.treeCode} aria-hidden="true">{index + 1}</span>)}
      </li>)}</ol>
    </div>;
  }
  return <div className={styles.sectionInner}>
    {k.intro()}
    <div className={styles.work} data-motif={planet}>{diagram}</div>
    {(k.c.caption || props.editable) && <p className={styles.workMethods}><Wrench size={16} aria-hidden="true" />{k.text("caption", "span")}</p>}
  </div>;
}

/* Links to articles of the Perspektiven, used on service and article pages. */
function RelatedSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  return <div className={styles.sectionInner}><div className={styles.related}>
    <div className={styles.relatedHead}>{k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text")}</div>
    <ul className={styles.relatedList}>{k.items.map((entry, index) => {
      const world = worldForText(entry.meta) ?? worldForText(entry.title) ?? index % 4;
      return <li key={entry.id} data-item-id={entry.id} data-world={world} className={styles.relatedItem}>
        <Planet world={world} className={styles.relatedPlanet} />
        <div>
          {k.itemText(entry, index, "meta", "span", styles.eyebrow)}
          <ContentLink href={entry.href} editable={props.editable} editField="href" editItemId={entry.id} className={styles.relatedTitle}>
            {k.itemText(entry, index, "title", k.sub)}<ArrowUpRight size={22} aria-hidden="true" />
          </ContentLink>
          {k.itemText(entry, index, "text")}
          {(entry.label || props.editable) && <span className={styles.relatedMore} aria-hidden={props.editable ? undefined : true}>{k.itemText(entry, index, "label", "span")}<ArrowRight size={16} /></span>}
        </div>
      </li>;
    })}</ul>
  </div></div>;
}

/* The shared closing call, with the people to talk to. */
function NextSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  return <div className={styles.sectionInner}><div className={styles.next} data-people={k.items.length || undefined}>
    <span className={styles.nextHorizon} aria-hidden="true" />
    <div className={styles.nextCopy}>
      {k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text")}{k.actions()}
    </div>
    {k.items.length > 0 && <ul className={styles.nextPeople}>{k.items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} className={styles.nextPerson}>
      <div className={styles.nextPhoto}>{k.photo(entry, index, styles.nextImage, "84px")}</div>
      <div>
        {k.itemText(entry, index, "title", k.sub, styles.nextName)}
        {k.itemText(entry, index, "label", "span", styles.nextRole)}
        {k.itemText(entry, index, "text", "p", styles.nextFocus)}
        <div className={styles.nextContact}>{k.contact(entry, index)}</div>
      </div>
    </li>)}</ul>}
  </div></div>;
}

/* /zusammenarbeit: Road2Goat as a winding route that draws itself while reading. */
function RouteSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState<{ d: string; width: number; height: number }>();
  const [reached, setReached] = useState(-1);
  const count = k.items.length;
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const relative = (rect: DOMRect) => ({ top: rect.top - box.top, bottom: rect.bottom - box.top, x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 });
      // Each stop is a marker plus its card; the trail runs down beside the card and switches sides in the gap below it.
      const stops = [...element.querySelectorAll<HTMLElement>("[data-route-stop]")].map(stop => {
        const marker = stop.querySelector<HTMLElement>("[data-route-marker]");
        const point = marker ? relative(marker.getBoundingClientRect()) : undefined;
        return point && { ...point, top: relative(stop.getBoundingClientRect()).top, bottom: relative(stop.getBoundingClientRect()).bottom };
      }).filter(Boolean) as { top: number; bottom: number; x: number; y: number }[];
      const goal = element.querySelector<HTMLElement>("[data-route-goal]");
      if (goal) { const point = relative(goal.getBoundingClientRect()); stops.push({ ...point, top: point.top, bottom: point.bottom }); }
      if (stops.length < 2) { setGeometry(undefined); return; }
      const f = (value: number) => value.toFixed(1);
      let d = `M${f(stops[0].x)},${f(stops[0].y)}`;
      for (let i = 1; i < stops.length; i++) {
        const a = stops[i - 1], b = stops[i];
        const half = Math.max(8, (b.top - a.bottom) / 2), mid = a.bottom + half;
        if (Math.abs(a.x - b.x) < 2) { d += `L${f(b.x)},${f(b.y)}`; continue; }
        d += `L${f(a.x)},${f(mid - half)}C${f(a.x)},${f(mid)} ${f(b.x)},${f(mid)} ${f(b.x)},${f(mid + half)}L${f(b.x)},${f(b.y)}`;
      }
      setGeometry({ d, width: box.width, height: box.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [count, props.editable]);
  useEffect(() => {
    const element = track.current;
    if (!element || props.editable || !props.motion || reducedMotion()) { setReached(count); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const line = innerHeight * .62;
      const value = Math.min(1, Math.max(0, (line - box.top) / box.height));
      progress.current?.style.setProperty("stroke-dashoffset", String(1 - value));
      const markers = [...element.querySelectorAll<HTMLElement>("[data-route-marker]")];
      setReached(markers.filter(marker => marker.getBoundingClientRect().top + 14 < line).length - 1);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); };
  }, [count, props.editable, props.motion, geometry]);
  const animated = !props.editable && props.motion && reached < count;
  return <div className={styles.pgWrap}><div className={styles.route}>
    <div className={styles.routeHead}>
      {k.text("subheading", "span", styles.eyebrow)}{k.text("heading", "p", styles.pgTitle)}{k.text("text", "p", styles.pgLead)}{k.actions()}
    </div>
    <div ref={track} className={styles.routeTrack} data-drawn={geometry ? "" : undefined}>
      {geometry && <svg className={styles.routePath} width={geometry.width} height={geometry.height} viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true" focusable="false">
        <path d={geometry.d} className={styles.routeBase} />
        <path ref={progress} d={geometry.d} className={styles.routeProgress} pathLength={1} style={{ strokeDashoffset: animated ? 1 : 0 }} />
      </svg>}
      {(k.c.attribution || props.editable) && <div className={styles.routeStart}><ArrowDown size={16} aria-hidden="true" />{k.text("attribution", "span")}</div>}
      <ol className={styles.routeStops}>{k.items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} data-route-stop="" className={styles.routeStop} data-side={index % 2 ? "in" : "out"} data-reached={index <= reached || undefined}>
        <span className={styles.routeMarker} data-route-marker="" aria-hidden="true">{pad(index + 1)}</span>
        <div className={styles.routeCard}>
          {k.itemText(entry, index, "title", "span", styles.eyebrow)}
          {k.itemText(entry, index, "label", k.sub, styles.routeLabel)}
          {k.itemText(entry, index, "text")}
          {k.list(entry, index, styles.routeNotes)}
        </div>
      </li>)}</ol>
      {(k.c.caption || props.editable) && <div className={styles.routeGoal}><span className={styles.routeSummit} data-route-goal="" aria-hidden="true"><Flag size={20} /></span>{k.text("caption", "p", styles.routeGoalText)}</div>}
    </div>
  </div></div>;
}

/* /zusammenarbeit: what both sides bring in, and the tempo. */
function TermsSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const groups = useMemo(() => {
    const map = new Map<string, { entry: ContentItem; index: number }[]>();
    k.items.forEach((entry, index) => {
      const name = entry.meta?.trim() || "";
      map.set(name, [...(map.get(name) || []), { entry, index }]);
    });
    return [...map.entries()].map(([name, entries]) => ({ name, entries }));
  }, [k.items]);
  const rename = (from: string) => (to: string) => k.update("items", k.items.map(entry => (entry.meta?.trim() || "") === from ? { ...entry, meta: to } : entry));
  return <div className={styles.sectionInner}>
    {k.intro()}
    <div className={styles.terms} data-columns={groups.length}>
      {groups.length === 2 && <span className={styles.termsSpine} aria-hidden="true"><span /></span>}
      {groups.map((group, position) => <div key={group.name || position} className={styles.termsCol} data-side={position % 2 ? "right" : "left"}>
        {(group.name || props.editable) && <EditableText value={group.name} as={k.sub} editable={props.editable} onChange={rename(group.name)} className={styles.termsHead} />}
        <ul>{group.entries.map(({ entry, index }) => <li key={entry.id} data-item-id={entry.id} className={styles.term}>
          {k.itemText(entry, index, "title", k.minor)}{k.itemText(entry, index, "text")}
        </li>)}</ul>
      </div>)}
    </div>
    {(k.c.quote || props.editable) && <div className={styles.tempo}>
      <span className={styles.tempoArt} aria-hidden="true"><span className={styles.tempoFast} /><span className={styles.tempoSlow} /><span className={styles.tempoCore} /></span>
      <div>{k.text("attribution", "span", styles.eyebrow)}{k.text("quote", "p", styles.tempoLine)}{k.text("caption", "p", styles.tempoText)}</div>
    </div>}
  </div>;
}

/* /ueber-uns: the people, portrait first. */
function PortraitsSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  return <div className={styles.pgWrap}>
    <div className={styles.portraitsHead}>{k.text("subheading", "span", styles.eyebrow)}{k.text("heading", "p", styles.pgTitle)}{k.text("text", "p", styles.pgLead)}{k.actions()}</div>
    <div className={styles.portraits} data-count={k.items.length}>
      {k.items.length === 2 && <svg className={styles.portraitLink} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M70,30 C170,0 230,120 330,90" /></svg>}
      {k.items.map((entry, index) => <article key={entry.id} data-item-id={entry.id} className={styles.portraitCard}>
        <div className={styles.portraitPhoto}>{k.photo(entry, index, styles.portraitImage, "(max-width: 760px) 180px, 280px")}</div>
        <div className={styles.portraitText}>
          {k.itemText(entry, index, "label", "span", styles.eyebrow)}
          {k.itemText(entry, index, "title", k.sub, styles.portraitName)}
          {k.itemText(entry, index, "text", "p", styles.portraitFocus)}
          {k.list(entry, index, styles.portraitBio, "details", "p")}
          {props.editable && !entry.details?.length && <p className={styles.pgEditorNote}>Kurzporträt noch nicht hinterlegt. Ergänzt es in den Einstellungen dieses Eintrags, sobald es freigegeben ist.</p>}
          <div className={styles.portraitContact}>{k.contact(entry, index)}</div>
        </div>
      </article>)}
    </div>
  </div>;
}

/* /ueber-uns: the attitude as large guiding words. */
function ValuesSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  return <div className={styles.sectionInner}><div className={styles.values}>
    <div className={styles.valuesHead}>{k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text", "p", styles.introText)}</div>
    <ol className={styles.valueList}>{k.items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} className={styles.value}>
      <span className={styles.valueNo} aria-hidden="true">{pad(index + 1)}</span>
      {k.itemText(entry, index, "title", k.sub, styles.valueWord)}
      <div className={styles.valueText}>{k.itemText(entry, index, "meta", "span", styles.eyebrow)}{k.itemText(entry, index, "text")}</div>
    </li>)}</ol>
  </div></div>;
}

const starPoints = [[10, 62], [27, 30], [46, 54], [63, 22], [84, 46], [70, 80], [40, 86], [20, 18]];
/* /ueber-uns: the team's competences as a constellation. */
function ConstellationSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const points = k.items.map((_, index) => starPoints[index % starPoints.length]);
  return <div className={styles.sectionInner}><div className={styles.constellation}>
    <div className={styles.constellationHead}>{k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text", "p", styles.introText)}</div>
    <div className={styles.starChart}>
      <svg className={styles.starLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} />
      </svg>
      <ul className={styles.starList}>{k.items.map((entry, index) => {
        const [x, y] = points[index];
        return <li key={entry.id} data-item-id={entry.id} className={styles.starItem} data-side={x > 66 ? "left" : "right"} style={{ "--x": `${x}%`, "--y": `${y}%`, "--i": index } as CSSProperties}>
          <span className={styles.star} aria-hidden="true" />
          <span className={styles.starLabel}>{k.itemText(entry, index, "title", "span", styles.starName)}{k.itemText(entry, index, "meta", "span", styles.starMeta)}{k.itemText(entry, index, "text", "span", styles.starText)}</span>
        </li>;
      })}</ul>
    </div>
  </div></div>;
}

const knownPlaces: [RegExp, number, number][] = [[/stuttgart/i, 24, 36], [/münchen|munich/i, 74, 66]];
/* /ueber-uns: the locations on a small map. */
function PlacesSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const positions = k.items.map((entry, index) => {
    const known = knownPlaces.find(([pattern]) => pattern.test(entry.title));
    return known ? [known[1], known[2]] : [20 + (index * 60) / Math.max(k.items.length - 1, 1), 50];
  });
  const [a, b] = positions;
  const arc = a && b ? `M${a[0]},${a[1] * .625} Q${(a[0] + b[0]) / 2},${Math.min(a[1], b[1]) * .625 - 16} ${b[0]},${b[1] * .625}` : "";
  return <div className={styles.sectionInner}><div className={styles.places}>
    <div className={styles.placesCopy}>
      {k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text", "p", styles.introText)}
      <ul className={styles.placeList}>{k.items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} className={styles.place}>
        {k.itemText(entry, index, "meta", "span", styles.eyebrow)}{k.itemText(entry, index, "title", k.sub)}{k.itemText(entry, index, "text", "p", styles.placeAddress)}
      </li>)}</ul>
    </div>
    <div className={styles.placeMap} aria-hidden="true">
      <svg viewBox="0 0 100 62.5" focusable="false">
        <g className={styles.placeGrid}>{[12.5, 25, 37.5, 50].map(y => <line key={`y${y}`} x1="0" x2="100" y1={y} y2={y} />)}{[20, 40, 60, 80].map(x => <line key={`x${x}`} y1="0" y2="62.5" x1={x} x2={x} />)}</g>
        {arc && <path d={arc} className={styles.placeArc} />}
        <g className={styles.placeCompass} transform="translate(90 10)"><circle r="5.2" /><path d="M0,-4.2L1.3,0L0,4.2L-1.3,0Z" /><text y="-6.4">N</text></g>
      </svg>
      {k.items.map((entry, index) => <span key={entry.id} className={styles.placePin} data-side={positions[index][0] > 60 ? "left" : "right"} style={{ "--x": `${positions[index][0]}%`, "--y": `${positions[index][1]}%` } as CSSProperties}>
        <span className={styles.placeDot} /><span className={styles.placeName}>{entry.title}</span>
      </span>)}
      {k.c.caption && a && b && <span className={styles.placeArcLabel} style={{ "--x": `${(a[0] + b[0]) / 2}%`, "--y": `${Math.min(a[1], b[1]) - 14}%` } as CSSProperties}>{k.c.caption}</span>}
    </div>
    {props.editable && <p className={styles.pgEditorNote}>Beschriftung der Verbindung: {k.text("caption", "span")}</p>}
  </div></div>;
}

/* /aktuelles: a lead article, a numbered index and a topic filter. */
function MagazineSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const topics = magazineTopics(k.items);
  const [topic, setTopic] = useState<string>();
  const entries = k.items.map((entry, index) => ({ entry, index }));
  const visible = props.editable || !topic ? entries : entries.filter(({ entry }) => entry.meta?.trim() === topic);
  const [lead, ...rest] = visible;
  const art = (entry: ContentItem, index: number) => entry.image ? <EditableImage image={entry.image} editable={props.editable} className={styles.magImage} sizes="(max-width: 760px) 100vw, 50vw" onChange={value => k.updateItem(index, "image", value)} />
    : <Planet world={worldForText(entry.meta) ?? index % 4} className={styles.magPlanet} />;
  return <div className={styles.pgWrap}><div className={styles.magazine}>
    <div className={styles.magHead}>{k.text("subheading", "span", styles.eyebrow)}{k.text("heading", "p", styles.pgTitle)}{k.text("text", "p", styles.pgLead)}</div>
    {topics.length > 1 && (props.editable
      ? <div className={styles.magFilter}>{k.text("attribution", "span", styles.magFilterLabel)}<span className={styles.magChip}>{k.text("caption", "span")}</span>{topics.map(name => <span key={name} className={styles.magChip}>{name}</span>)}</div>
      : <div className={styles.magFilter} role="group" aria-label={k.c.attribution || "Nach Thema filtern"}>
        {k.c.attribution && <span className={styles.magFilterLabel} aria-hidden="true">{k.c.attribution}</span>}
        <button type="button" className={styles.magChip} aria-pressed={!topic} onClick={() => setTopic(undefined)}>{k.c.caption || "Alle"}</button>
        {topics.map(name => <button key={name} type="button" className={styles.magChip} aria-pressed={topic === name} data-world={worldForText(name)} onClick={() => setTopic(name)}>{name}</button>)}
      </div>)}
    <p className={styles.srOnly} role="status">{topic && !props.editable ? `${visible.length} ${visible.length === 1 ? "Beitrag" : "Beiträge"}: ${topic}` : ""}</p>
    {lead && <article key={lead.entry.id} data-item-id={lead.entry.id} className={styles.magLead} data-world={worldForText(lead.entry.meta) ?? lead.index % 4}>
      <div className={styles.magArt}>{art(lead.entry, lead.index)}</div>
      <div className={styles.magLeadCopy}>
        <div className={styles.magMeta}>{k.itemText(lead.entry, lead.index, "meta", "span")}{k.list(lead.entry, lead.index, styles.magFormats, "tags")}</div>
        <ContentLink href={lead.entry.href} editable={props.editable} editField="href" editItemId={lead.entry.id} className={styles.magTitle}>{k.itemText(lead.entry, lead.index, "title", "h2")}</ContentLink>
        {k.itemText(lead.entry, lead.index, "text", "p", styles.magTeaser)}
        {(lead.entry.label || props.editable) && <span className={styles.magMore} aria-hidden={props.editable ? undefined : true}>{k.itemText(lead.entry, lead.index, "label", "span")}<ArrowRight size={17} /></span>}
      </div>
    </article>}
    {rest.length > 0 && <ol className={styles.magIndex}>{rest.map(({ entry, index }, position) => <li key={entry.id} data-item-id={entry.id} data-world={worldForText(entry.meta) ?? index % 4} className={styles.magRow}>
      <span className={styles.magNo} aria-hidden="true">{pad(position + 2)}</span>
      <div className={styles.magRowCopy}>
        <div className={styles.magMeta}>{k.itemText(entry, index, "meta", "span")}{k.list(entry, index, styles.magFormats, "tags")}</div>
        <ContentLink href={entry.href} editable={props.editable} editField="href" editItemId={entry.id} className={styles.magTitle}>{k.itemText(entry, index, "title", "h2")}</ContentLink>
        {k.itemText(entry, index, "text", "p", styles.magTeaser)}
      </div>
      <Planet world={worldForText(entry.meta) ?? index % 4} className={styles.magRowPlanet} />
      <ArrowUpRight className={styles.magArrow} size={24} aria-hidden="true" />
    </li>)}</ol>}
  </div></div>;
}

/* Article pages: reading layout with progress, chapter index and facts. */
function ArticleSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const facts = factLines(k.c.quote);
  const prefix = props.section.anchor || props.section.id;
  const chapterId = (index: number) => `${prefix}-kapitel-${index + 1}`;
  const world = worldForText(k.c.subheading) ?? worldForText(k.c.heading) ?? 1;
  useEffect(() => {
    const element = root.current;
    if (props.editable || !element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const total = Math.max(1, box.height - innerHeight * .55);
      const value = Math.min(1, Math.max(0, -box.top / total));
      bar.current?.style.setProperty("transform", `scaleX(${value.toFixed(4)})`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    const chapters = [...element.querySelectorAll<HTMLElement>("[data-chapter]")];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).map(entry => Number((entry.target as HTMLElement).dataset.chapter));
      if (visible.length) setActive(Math.min(...visible));
    }, { rootMargin: "-25% 0px -60% 0px" });
    chapters.forEach(chapter => observer.observe(chapter));
    return () => { cancelAnimationFrame(frame); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); observer.disconnect(); };
  }, [props.editable, k.items.length]);
  return <div ref={root} className={styles.article} data-world={world}>
    {!props.editable && <div className={styles.readProgress} aria-hidden="true"><span ref={bar} /></div>}
    <div className={styles.articleHead}>
      <div className={styles.articleHeadCopy}>
        {k.text("subheading", "span", styles.eyebrow)}{k.text("heading", "p", styles.articleHeadline)}{k.text("text", "p", styles.articleLead)}
        {(k.c.attribution || k.c.caption || props.editable) && <p className={styles.byline}>
          {k.text("attribution", "span")}{k.c.attribution && k.c.caption && <span aria-hidden="true"> · </span>}{k.text("caption", "span")}
        </p>}
        {k.actions()}
      </div>
      {k.c.image || props.editable ? <EditableImage image={k.c.image} editable={props.editable} className={styles.articleCover} priority sizes="(max-width: 760px) 100vw, 40vw" onChange={value => k.update("image", value)} />
        : <div className={styles.articleVisual} aria-hidden="true"><Planet world={world} className={styles.articlePlanet} /></div>}
    </div>
    <div className={styles.articleBody}>
      <div className={styles.articleAside}>
        {k.items.length > 1 && <nav className={styles.toc} aria-label="Kapitel dieses Beitrags"><ol>{k.items.map((entry, index) => <li key={entry.id}>
          <a href={`#${chapterId(index)}`} aria-current={!props.editable && active === index ? "location" : undefined}><span aria-hidden="true">{pad(index + 1)}</span>{entry.title}</a>
        </li>)}</ol></nav>}
        {(facts.facts.length > 0 || props.editable) && <aside className={styles.facts}>
          {props.editable ? <EditableText value={k.c.quote} as="div" editable onChange={value => k.update("quote", value)} className={styles.factsEdit} />
            : <>{facts.title && <h2 className={styles.factsTitle}>{facts.title}</h2>}<dl>{facts.facts.map((fact, index) => <div key={index}>{fact.term && <dt>{fact.term}</dt>}<dd>{fact.detail}</dd></div>)}</dl></>}
        </aside>}
      </div>
      <div className={styles.chapters}>{k.items.map((entry, index) => <div key={entry.id} id={chapterId(index)} data-item-id={entry.id} data-chapter={index} className={styles.chapter}>
        <span className={styles.chapterNo} aria-hidden="true">{pad(index + 1)}</span>
        {k.itemText(entry, index, "title", "h2", styles.chapterTitle)}
        {k.itemText(entry, index, "text")}
        {(entry.href || props.editable && entry.label) && k.itemLink(entry, index, styles.chapterLink)}
      </div>)}</div>
    </div>
  </div>;
}

/* /kontakt: what happens after sending a message. */
function AfterSection(props: ComondiPageSectionProps) {
  const k = useKit(props);
  const last = k.items.length - 1;
  return <div className={styles.sectionInner}><div className={styles.after}>
    <div className={styles.afterHead}>{k.text("subheading", "span", styles.eyebrow)}{k.text("heading")}{k.text("text", "p", styles.introText)}</div>
    <ol className={styles.afterTrack} style={{ "--count": k.items.length } as CSSProperties}>{k.items.map((entry, index) => <li key={entry.id} data-item-id={entry.id} className={styles.afterStep}>
      <span className={styles.afterNode} aria-hidden="true">{index === 0 ? <Send size={18} /> : index === last ? <MessagesSquare size={18} /> : pad(index + 1)}</span>
      {k.itemText(entry, index, "meta", "span", styles.afterStatus)}
      {k.itemText(entry, index, "title", k.sub, styles.afterTitle)}
      {k.itemText(entry, index, "text")}
    </li>)}</ol>
  </div></div>;
}

const renderers: Partial<Record<Section["type"], (props: ComondiPageSectionProps) => ReactNode>> = {
  "comondi-map": MapSection,
  "comondi-pairs": PairsSection,
  "comondi-formats": FormatsSection,
  "comondi-planet-hero": PlanetHero,
  "comondi-questions": QuestionsSection,
  "comondi-service-work": ServiceWork,
  "comondi-related": RelatedSection,
  "comondi-next": NextSection,
  "comondi-route": RouteSection,
  "comondi-terms": TermsSection,
  "comondi-portraits": PortraitsSection,
  "comondi-values": ValuesSection,
  "comondi-constellation": ConstellationSection,
  "comondi-places": PlacesSection,
  "comondi-magazine": MagazineSection,
  "comondi-article": ArticleSection,
  "comondi-after": AfterSection,
};

export const hasComondiPageSection = (type: Section["type"]) => type in renderers;

export function ComondiPageSection(props: ComondiPageSectionProps) {
  const Renderer = renderers[props.section.type];
  return Renderer ? <Renderer {...props} /> : null;
}

export type { Kit as ComondiKit };
