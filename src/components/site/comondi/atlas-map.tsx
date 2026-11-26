"use client";

import { useId } from "react";
import { ArrowUpRight } from "lucide-react";
import { ContentLink } from "../editable";
import { styles } from "./styles";

const width = 600;
const height = 520;
const left = { x: 238, y: 268, r: 172 };
const right = { x: 392, y: 246, r: 150 };
const orbit = { x: 312, y: 262, rx: 276, ry: 168, tilt: -14 };

/** A closed, gently irregular ring: the contour lines of the first world. */
function contour(step: number) {
  const points: string[] = [];
  for (let angle = 0; angle < 360; angle += 12) {
    const rad = (angle * Math.PI) / 180;
    const radius = 18 + step * 23 + Math.sin(rad * 3 + step * .7) * step * 1.9 + Math.cos(rad * 2 - step) * step * 1.2;
    points.push(`${(left.x - 34 + Math.cos(rad) * radius).toFixed(1)},${(left.y + 20 + Math.sin(rad) * radius * .86).toFixed(1)}`);
  }
  return `M${points.join("L")}Z`;
}

/** Positions on the tilted orbit, returned as percentages of the drawing. */
function orbitPoint(degrees: number) {
  const t = (degrees * Math.PI) / 180;
  const tilt = (orbit.tilt * Math.PI) / 180;
  const x = orbit.rx * Math.cos(t);
  const y = orbit.ry * Math.sin(t);
  return { left: ((orbit.x + x * Math.cos(tilt) - y * Math.sin(tilt)) / width) * 100, top: ((orbit.y + x * Math.sin(tilt) + y * Math.cos(tilt)) / height) * 100 };
}
const pinAngles = [208, 300, 22, 128, 250, 70];

/**
 * The Atlas opening: two worlds — one drawn as terrain, one as a grid — overlap in the
 * co:mondi colour. The service worlds sit on an orbit around both and link to their pages.
 */
export function AtlasMap({ links, editable = false, label }: { links: { id: string; title: string; href?: string }[]; editable?: boolean; label?: string }) {
  const pins = links.slice(0, pinAngles.length);
  const id = useId().replace(/:/g, "");
  return <div className={styles.atlasMap}>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label || "Zwei Welten, die sich überschneiden"}>
      <defs>
        <clipPath id={`${id}-left`}><circle cx={left.x} cy={left.y} r={left.r} /></clipPath>
        <clipPath id={`${id}-right`}><circle cx={right.x} cy={right.y} r={right.r} /></clipPath>
      </defs>
      <ellipse className={styles.atlasOrbit} cx={orbit.x} cy={orbit.y} rx={orbit.rx} ry={orbit.ry} transform={`rotate(${orbit.tilt} ${orbit.x} ${orbit.y})`} pathLength={1} />
      <g className={styles.atlasTerrain} clipPath={`url(#${id}-left)`}>
        <circle cx={left.x} cy={left.y} r={left.r} />
        {Array.from({ length: 9 }, (_, step) => <path key={step} d={contour(step + 1)} />)}
      </g>
      <g className={styles.atlasGrid} clipPath={`url(#${id}-right)`}>
        <circle cx={right.x} cy={right.y} r={right.r} />
        {[0, 38, 76, 114, 150].map(rx => <ellipse key={rx} cx={right.x} cy={right.y} rx={rx} ry={right.r} />)}
        {[-120, -80, -40, 0, 40, 80, 120].map(dy => <line key={dy} x1={right.x - right.r} x2={right.x + right.r} y1={right.y + dy} y2={right.y + dy} />)}
      </g>
      <g clipPath={`url(#${id}-left)`}><circle className={styles.atlasBridge} cx={right.x} cy={right.y} r={right.r} /></g>
      <circle className={styles.atlasRim} cx={left.x} cy={left.y} r={left.r} />
      <circle className={styles.atlasRim} cx={right.x} cy={right.y} r={right.r} />
    </svg>
    {pins.length > 0 && <ul className={styles.atlasPins}>
      {pins.map((pin, index) => {
        const point = orbitPoint(pinAngles[index]);
        return <li key={pin.id} style={{ left: `${point.left}%`, top: `${point.top}%`, animationDelay: `${700 + index * 110}ms` }} data-side={point.left > 55 ? "right" : "left"}>
          <ContentLink href={pin.href} editable={editable} className={styles.atlasPin}><span>{pin.title}</span><ArrowUpRight size={15} aria-hidden="true" /></ContentLink>
        </li>;
      })}
    </ul>}
  </div>;
}
