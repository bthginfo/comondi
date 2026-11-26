/**
 * Timeline of the Kosmos opening journey. Scrolling through the pinned opening moves a single
 * value from 0 to 1. It passes a sequence of shots: the overview (shot 0), one shot per service
 * world (1…n) and the closing overview (n + 1). Every shot has a calm hold so the text can be
 * read; between two holds the camera travels and the text changes.
 */
export const journeyWeights = { opening: 0.55, travel: 1, stay: 0.95, closing: 0.5 } as const;
/** The scene has four planets; more worlds would make the opening longer than it is useful. */
export const maxJourneyWorlds = 6;

export interface JourneySegment { from: number; to: number; start: number; end: number }
export interface JourneyPosition { from: number; to: number; t: number }

const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};
/** Zero speed and acceleration at both ends, so travel starts and stops without a jolt. */
export const smootherstep = (value: number) => {
  const x = clamp01(value);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/** Length of the journey in weight units; the opening uses it to size the scroll track. */
export function journeyUnits(worlds: number) {
  const count = Math.max(0, Math.min(maxJourneyWorlds, Math.floor(worlds)));
  return journeyWeights.opening + (count + 1) * journeyWeights.travel + count * journeyWeights.stay + journeyWeights.closing;
}

const segmentCache = new Map<number, JourneySegment[]>();
export function journeySegments(worlds: number): JourneySegment[] {
  const count = Math.max(0, Math.min(maxJourneyWorlds, Math.floor(worlds)));
  const cached = segmentCache.get(count);
  if (cached) return cached;
  const total = journeyUnits(count);
  const list: JourneySegment[] = [];
  let cursor = 0;
  const push = (from: number, to: number, weight: number) => {
    list.push({ from, to, start: cursor / total, end: (cursor + weight) / total });
    cursor += weight;
  };
  push(0, 0, journeyWeights.opening);
  for (let shot = 1; shot <= count + 1; shot++) {
    push(shot - 1, shot, journeyWeights.travel);
    push(shot, shot, shot === count + 1 ? journeyWeights.closing : journeyWeights.stay);
  }
  list[list.length - 1].end = 1;
  segmentCache.set(count, list);
  return list;
}

/** Which shots the progress lies between; t runs from 0 to 1 while travelling and is 0 in a hold. */
export function journeyPosition(progress: number, worlds: number): JourneyPosition {
  const value = clamp01(progress);
  const segments = journeySegments(worlds);
  const segment = segments.find(entry => value <= entry.end) ?? segments[segments.length - 1];
  if (segment.from === segment.to) return { from: segment.from, to: segment.to, t: 0 };
  return { from: segment.from, to: segment.to, t: clamp01((value - segment.start) / (segment.end - segment.start)) };
}

/** The copy panel of a shot: the opening text returns for the closing overview. */
export const journeyPanel = (shot: number, worlds: number) => shot > worlds ? 0 : shot;

export interface JourneyPanelState { opacity: number; offset: number }

/**
 * Visibility of each copy panel (index 0 = opening text, 1…n = worlds). The outgoing text leaves
 * early and moves up a little; the next one rises in once the camera is close to its planet, so
 * the middle of every flight belongs to the scene alone.
 */
export function journeyPanels(progress: number, worlds: number): JourneyPanelState[] {
  const count = Math.max(0, Math.min(maxJourneyWorlds, Math.floor(worlds)));
  const panels: JourneyPanelState[] = Array.from({ length: count + 1 }, () => ({ opacity: 0, offset: 0 }));
  const { from, to, t } = journeyPosition(progress, count);
  if (from === to) {
    panels[journeyPanel(from, count)] = { opacity: 1, offset: 0 };
    return panels;
  }
  const leaving = smoothstep(0.04, 0.38, t);
  const arriving = smoothstep(0.56, 0.92, t);
  const outgoing = panels[journeyPanel(from, count)];
  outgoing.opacity = 1 - leaving;
  outgoing.offset = -leaving;
  const incoming = panels[journeyPanel(to, count)];
  if (incoming.opacity < arriving) {
    incoming.opacity = arriving;
    incoming.offset = 1 - arriving;
  }
  return panels;
}

/** Progress in the middle of a shot's hold: where the world navigation scrolls to. */
export function journeyStop(shot: number, worlds: number) {
  const segments = journeySegments(worlds);
  const hold = segments.find(entry => entry.from === shot && entry.to === shot);
  if (!hold) return shot <= 0 ? 0 : 1;
  if (shot === 0) return 0;
  return (hold.start + hold.end) / 2;
}

/** How strongly each world is in focus (0…1), for the navigation and the scene. */
export function journeyFocus(progress: number, worlds: number) {
  const count = Math.max(0, Math.min(maxJourneyWorlds, Math.floor(worlds)));
  const focus = new Array<number>(count).fill(0);
  const { from, to, t } = journeyPosition(progress, count);
  const eased = smootherstep(t);
  if (from >= 1 && from <= count) focus[from - 1] += from === to ? 1 : 1 - eased;
  if (to !== from && to >= 1 && to <= count) focus[to - 1] += eased;
  return focus;
}
