"use client";

import { Component, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { ContentLink } from "../editable";
import { textWithBreaks } from "../text-wrap";
import { journeyPanels, journeyPosition, journeyStop, journeyUnits } from "@/lib/comondi-journey";
import { styles } from "./styles";

export interface JourneyWorld { id: string; title: string; meta?: string; text?: string; href?: string; planet: number }
/** A rectangle in the pinned stage, as fractions of its width and height. */
export interface JourneyRect { x: number; y: number; width: number; height: number }

/**
 * Shared between the opening's copy and its planet scene. The controller writes it on every frame
 * and the scene reads it while rendering; nothing here goes through React state.
 */
export interface JourneyHandle {
  /** Planet index of each world in journey order: 0 Jupiter, 1 Neptune, 2 Saturn, 3 Moon. */
  worlds: number[];
  /** Damped journey progress (0…1); the scene and the copy both follow this value. */
  shown: number;
  moving: boolean;
  /** Desktop layout: copy on the left, planet on the right. Otherwise planet above the copy. */
  wide: boolean;
  /** Where today's opening image sits: the overview shot frames the system exactly there. */
  overview: JourneyRect;
  /** Free area for a world's planet next to (or above) the copy. */
  focus: JourneyRect;
  render: ((now: number) => void) | null;
  go: (shot: number) => void;
  step: (direction: number) => void;
  fail: () => void;
}

const rise = 22;
const emptyRect: JourneyRect = { x: 0.5, y: 0, width: 0.5, height: 1 };

/**
 * The Kosmos opening as a pinned scroll journey. It renders today's static opening instead when
 * motion is reduced or paused, or when the scene cannot start, and keeps the reader's place when
 * the opening changes between the two.
 */
export function HeroJourney({ sectionId, worlds, copy, scene, staticHero, paused, headingLevel }: {
  sectionId: string; worlds: JourneyWorld[]; copy: ReactNode; scene: (journey: JourneyHandle) => ReactNode;
  staticHero: ReactNode; paused: boolean; headingLevel: "h2" | "h3";
}) {
  const [motion, setMotion] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    // Mirrors the stylesheet: no journey with reduced motion or on screens too short for the stage (landscape phones).
    const preference = matchMedia("(prefers-reduced-motion: no-preference) and (min-height: 520px)");
    const sync = () => setMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  const on = motion && !paused && !failed;
  return <KeepScrollPlace sectionId={sectionId} mode={on ? "journey" : "static"}>
    {on ? <Journey worlds={worlds} copy={copy} scene={scene} headingLevel={headingLevel} onFail={() => setFailed(true)} /> : staticHero}
  </KeepScrollPlace>;
}

type Place = { below: true; top: number } | { below: false };

/** Switching between the tall journey and the static opening must not move the content the reader is looking at. */
class KeepScrollPlace extends Component<{ sectionId: string; mode: string; children: ReactNode }> {
  private section() {
    return document.querySelector<HTMLElement>(`[data-section-id="${CSS.escape(this.props.sectionId)}"]`);
  }
  getSnapshotBeforeUpdate(previous: { mode: string }): Place | null {
    if (previous.mode === this.props.mode) return null;
    const section = this.section();
    if (!section) return null;
    const box = section.getBoundingClientRect();
    const next = section.nextElementSibling;
    if (box.bottom <= 0 && next) return { below: true, top: next.getBoundingClientRect().top };
    return box.top < 0 ? { below: false } : null;
  }
  componentDidUpdate(_previous: unknown, _state: unknown, place: Place | null) {
    const section = place && this.section();
    if (!place || !section) return;
    if (place.below) {
      const next = section.nextElementSibling;
      const shift = next ? next.getBoundingClientRect().top - place.top : 0;
      if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: "instant" });
    } else {
      const header = section.closest("[data-cm-design]")?.querySelector("header")?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - header), behavior: "instant" });
    }
  }
  render() { return this.props.children; }
}

function Journey({ worlds, copy, scene, headingLevel, onFail }: {
  worlds: JourneyWorld[]; copy: ReactNode; scene: (journey: JourneyHandle) => ReactNode; headingLevel: "h2" | "h3"; onFail: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const fill = useRef<HTMLSpanElement>(null);
  const fail = useRef(onFail);
  fail.current = onFail;
  const count = worlds.length;
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState<number | null>(null);
  const focusRequest = useRef<number | null>(null);
  const reached = useRef(false);
  const handle = useRef<JourneyHandle>(null as unknown as JourneyHandle);
  if (!handle.current) handle.current = {
    worlds: worlds.map(world => world.planet), shown: 0, moving: false, wide: true, overview: emptyRect, focus: emptyRect,
    render: null, go: () => {}, step: () => {}, fail: () => fail.current(),
  };
  handle.current.worlds = worlds.map(world => world.planet);
  const sceneNode = useMemo(() => scene(handle.current), [scene]);

  useEffect(() => {
    const trackElement = track.current, stageElement = stage.current;
    if (!trackElement || !stageElement) return;
    const journey = handle.current;
    const panels = panelsRef.current.slice(0, count + 1);
    const cache = panels.map(() => ({ opacity: -1, offset: -1 }));
    const wideQuery = matchMedia("(min-width: 761px)");
    let frame = 0, last = 0, stickyTop = 0, distance = 1, target = 0, measured = false, current = active, fillValue = -1, opening = -1;

    const relative = (box: DOMRect, stageBox: DOMRect): JourneyRect => ({
      x: (box.left - stageBox.left) / stageBox.width, y: (box.top - stageBox.top) / stageBox.height,
      width: box.width / stageBox.width, height: box.height / stageBox.height,
    });
    const measure = () => {
      // On smartphones the overview gets the room above the opening text.
      stageElement.style.setProperty("--cm-journey-copy", `${panels[0]?.offsetHeight ?? 0}px`);
      const stageBox = stageElement.getBoundingClientRect();
      if (!stageBox.width || !stageBox.height) return;
      stickyTop = parseFloat(getComputedStyle(stageElement).top) || 0;
      distance = Math.max(1, trackElement.offsetHeight - stageElement.offsetHeight);
      journey.wide = wideQuery.matches;
      // Today's opening image keeps its proportions; the overview frames the planets inside it.
      const box = stageElement.querySelector<HTMLElement>("[data-journey-box]")?.getBoundingClientRect();
      if (box?.width && box.height) {
        const aspect = journey.wide ? 1.19 : 1.43;
        const width = Math.min(box.width, box.height * aspect), height = width / aspect;
        journey.overview = relative(new DOMRect(box.left + (box.width - width) / 2, box.top + (box.height - height) / 2, width, height), stageBox);
      }
      if (journey.wide) {
        const visual = stageElement.querySelector<HTMLElement>("[data-journey-visual]")?.getBoundingClientRect();
        if (visual?.width) journey.focus = relative(visual, stageBox);
      } else {
        // Above the tallest world text, below the header, with a little air on both sides.
        const copyTop = panels[0]?.offsetParent?.getBoundingClientRect().top ?? stageBox.top;
        const top = Math.min(...panels.slice(1).map(panel => panel ? copyTop + panel.offsetTop : stageBox.bottom));
        const height = Math.max(stageBox.height * 0.3, top - stageBox.top - 12);
        journey.focus = { x: 0, y: 0, width: 1, height: height / stageBox.height };
      }
      stageElement.style.setProperty("--cm-journey-focus-y", `${(journey.focus.y + journey.focus.height / 2) * 100}%`);
    };
    const read = () => {
      target = Math.min(1, Math.max(0, (stickyTop - trackElement.getBoundingClientRect().top) / distance));
    };
    const write = () => {
      const states = journeyPanels(journey.shown, count);
      states.forEach((state, index) => {
        const panel = panels[index];
        if (!panel) return;
        const opacity = Math.round(state.opacity * 1000) / 1000, offset = Math.round(state.offset * 1000) / 1000;
        const previous = cache[index];
        if (previous.opacity === opacity && previous.offset === offset) return;
        previous.opacity = opacity; previous.offset = offset;
        panel.style.opacity = String(opacity);
        panel.style.transform = offset ? `translate3d(0, ${(offset * rise).toFixed(2)}px, 0)` : "";
        panel.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      });
      const openingValue = Math.round(states[0].opacity * 1000) / 1000;
      if (openingValue !== opening) { opening = openingValue; stageElement.style.setProperty("--cm-journey-opening", String(opening)); }
      const { from, to, t } = journeyPosition(journey.shown, count);
      const shot = t < 0.47 ? from : to;
      const next = shot > count ? 0 : shot;
      if (next !== current) { current = next; setActive(next); }
      // The rail line fills from the first to the last world.
      const first = journeyStop(1, count), lastStop = journeyStop(count, count);
      const value = Math.round(Math.min(1, Math.max(0, (journey.shown - first) / Math.max(lastStop - first, 0.001))) * 1000) / 1000;
      if (value !== fillValue && fill.current) { fillValue = value; fill.current.style.transform = `scaleY(${value})`; }
    };
    const tick = (now: number) => {
      frame = 0;
      read();
      if (!measured) { measured = true; journey.shown = target; }
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      const gap = target - journey.shown;
      journey.shown = Math.abs(gap) < 0.0003 ? target : journey.shown + gap * (1 - Math.exp(-delta * 7));
      journey.moving = journey.shown !== target;
      write();
      journey.render?.(now);
      if (journey.moving) frame = requestAnimationFrame(tick);
      else last = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const resize = () => { measure(); schedule(); };
    journey.go = shot => {
      const progress = journeyStop(Math.max(0, Math.min(count + 1, shot)), count);
      const top = window.scrollY + trackElement.getBoundingClientRect().top - stickyTop + progress * distance;
      window.scrollTo({ top: Math.round(top), behavior: "smooth" });
    };
    journey.step = direction => {
      const { from, to, t } = journeyPosition(target, count);
      const shot = t < 0.5 ? from : to;
      journey.go(Math.max(direction > 0 ? 1 : 0, Math.min(count, shot + Math.sign(direction))));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stageElement);
    panels.forEach(panel => panel && observer.observe(panel));
    measure();
    read();
    journey.shown = target;
    measured = true;
    write();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    wideQuery.addEventListener("change", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      wideQuery.removeEventListener("change", resize);
      journey.go = () => {}; journey.step = () => {}; journey.moving = false;
    };
    // The controller reads the DOM it was mounted with; the panels only change with the worlds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // A world keeps its focus while the reader travels there; once they scroll on, it becomes inert again.
  useEffect(() => {
    if (held === null) return;
    if (active === held) { reached.current = true; return; }
    if (reached.current) { reached.current = false; setHeld(null); }
  }, [active, held]);
  useEffect(() => {
    const index = focusRequest.current;
    if (index === null || held !== index) return;
    focusRequest.current = null;
    panelsRef.current[index]?.focus({ preventScroll: true });
  }, [held]);

  // Keyboard focus on the opening text brings it back into view.
  const openingFocus = () => {
    if (active === 0) return;
    handle.current.go(handle.current.shown < 0.5 ? 0 : count + 1);
  };
  const choose = (index: number) => {
    reached.current = false;
    focusRequest.current = index + 1;
    setHeld(index + 1);
    handle.current.go(index + 1);
  };
  const Heading = headingLevel;
  const style = { "--cm-journey-units": journeyUnits(count) } as CSSProperties;

  return <div ref={track} className={styles.journeyTrack} style={style} data-cm-journey="">
    <div ref={stage} className={styles.journeyStage}>
      <div className={`${styles.heroGlow} ${styles.journeyGlow}`} aria-hidden="true" />
      <div className={`${styles.heroInner} ${styles.journeyInner}`}>
        <div className={styles.journeyCopy}>
          <div ref={element => { panelsRef.current[0] = element; }} className={`${styles.heroCopy} ${styles.journeyPanel}`} data-journey-panel="0" onFocus={openingFocus}>
            {copy}
          </div>
          {worlds.map((world, index) => {
            const shot = index + 1;
            const live = active === shot || held === shot;
            const titleId = `journey-${world.id}`;
            return <div key={world.id} ref={element => { panelsRef.current[shot] = element; }} className={`${styles.journeyPanel} ${styles.journeyWorld}`}
              data-journey-panel={shot} data-world={world.planet} role="group" aria-labelledby={titleId}
              tabIndex={-1} inert={!live} aria-hidden={!live || undefined}
              onFocus={() => setHeld(shot)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(value => value === shot ? null : value); }}>
              {world.meta && <span className={styles.eyebrow}><span className={styles.worldDot} aria-hidden="true" />{world.meta}</span>}
              <Heading id={titleId} className={styles.journeyTitle}>{textWithBreaks(world.title)}</Heading>
              {world.text && <p className={styles.journeyText}>{textWithBreaks(world.text)}</p>}
              {world.href && <ContentLink href={world.href} className={styles.outlineButton} label={`Mehr über ${world.title} erfahren`}>
                Mehr erfahren <ArrowUpRight size={17} aria-hidden="true" />
              </ContentLink>}
            </div>;
          })}
        </div>
        <div className={`${styles.heroVisual} ${styles.journeyVisual}`} data-journey-visual="">{sceneNode}</div>
      </div>
      <nav className={styles.journeyRail} aria-label="Welten im Überblick">
        <span className={styles.journeyLine} aria-hidden="true"><span ref={fill} /></span>
        <ol>{worlds.map((world, index) => <li key={world.id} data-world={world.planet}>
          <button type="button" aria-current={active === index + 1 ? "step" : undefined} onClick={() => choose(index)}>
            <span className={styles.journeyLabel}>{world.title}</span><span className={styles.journeyDot} aria-hidden="true" />
          </button>
        </li>)}</ol>
      </nav>
    </div>
  </div>;
}
