import { useId } from "react";
import { styles } from "./styles";

const cx = 130, cy = 112, r = 76;
const ellipse = (x: number, y: number, rx: number, ry: number) => `M${x - rx},${y}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
/** A cloud band that follows the curve of the sphere. */
const band = (y: number, height: number, bulge = 9) => `M${cx - r - 4},${y}Q${cx},${y + bulge} ${cx + r + 4},${y}L${cx + r + 4},${y + height}Q${cx},${y + height + bulge} ${cx - r - 4},${y + height}Z`;
const ring = { outer: [124, 31], inner: [94, 21], gap: [110, 26.5], tilt: -15 } as const;

/**
 * Atlas draws each service world as an engraved planet: ink outline, a flat offset shadow in the
 * world colour, hatched night side and one highlight. 0 Jupiter (bands and spot), 1 Neptune (storm),
 * 2 Saturn (ring in front of and behind the sphere), 3 Moon (craters and a small companion).
 */
export function AtlasPlanet({ world }: { world: number }) {
  const id = useId().replace(/:/g, "");
  const sphere = `${id}-sphere`, hatch = `${id}-hatch`, front = `${id}-front`;
  const ringBand = `${ellipse(cx, cy, ring.outer[0], ring.outer[1])}${ellipse(cx, cy, ring.inner[0], ring.inner[1])}`;
  return <svg className={styles.atlasPlanet} viewBox="0 0 260 230" aria-hidden="true" focusable="false" data-planet={world}>
    <defs>
      <clipPath id={sphere}><circle cx={cx} cy={cy} r={r} /></clipPath>
      <clipPath id={front}><rect x="-20" y={cy} width="300" height="140" /></clipPath>
      <pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
        <line x1="0" y1="0" x2="0" y2="5" className={styles.apHatch} />
      </pattern>
    </defs>
    <circle cx={cx + 11} cy={cy + 11} r={r} className={styles.apDrop} />
    {world === 2 && <g transform={`rotate(${ring.tilt} ${cx} ${cy})`}>
      <path d={ringBand} fillRule="evenodd" className={styles.apRing} />
      <path d={ellipse(cx, cy, ring.gap[0], ring.gap[1])} className={styles.apRingLine} />
    </g>}
    <circle cx={cx} cy={cy} r={r} className={styles.apBody} />
    <g clipPath={`url(#${sphere})`}>
      {world === 0 && <>
        <path d={band(52, 14)} className={styles.apBandSoft} />
        <path d={band(76, 18)} className={styles.apBandStrong} />
        <path d={band(102, 9)} className={styles.apBandSoft} />
        <path d={band(124, 20)} className={styles.apBandStrong} />
        <path d={band(156, 12)} className={styles.apBandSoft} />
        <path d={`M${cx - r},${118}Q${cx},${128} ${cx + r},${118}`} className={styles.apLine} />
        <ellipse cx="158" cy="136" rx="17" ry="9.5" className={styles.apSpot} />
        <ellipse cx="158" cy="136" rx="8" ry="4" className={styles.apSpotCore} />
      </>}
      {world === 1 && <>
        <path d={band(64, 10, 6)} className={styles.apBandSoft} />
        <path d={band(140, 14, 6)} className={styles.apBandSoft} />
        {[78, 92, 152, 168].map(y => <path key={y} d={`M${cx - r},${y}Q${cx},${y + 7} ${cx + r},${y - 2}`} className={styles.apLine} />)}
        <path d="M100,108c10-12 30-10 34 2 4 12-8 22-20 19-10-2-13-12-6-17 6-4 13 0 11 6" className={styles.apSwirl} />
        <ellipse cx="160" cy="98" rx="12" ry="7" className={styles.apSpot} />
      </>}
      {world === 2 && <>
        <path d={band(62, 12)} className={styles.apBandSoft} />
        <path d={band(84, 16)} className={styles.apBandStrong} />
        <path d={band(130, 14)} className={styles.apBandSoft} />
        <path d={`M${cx - r},${110}Q${cx},${119} ${cx + r},${110}`} className={styles.apLine} />
      </>}
      {world === 3 && <>
        <path d="M84,84c14-10 36-6 40 6 3 10-10 16-24 14-16-2-26-12-16-20z" className={styles.apMare} />
        <path d="M128,138c12-8 34-4 34 8 0 10-18 14-30 10-10-3-12-12-4-18z" className={styles.apMare} />
        {[[150, 72, 11], [98, 132, 8], [172, 118, 6], [118, 64, 5], [76, 110, 5], [140, 168, 7]].map(([x, y, size]) =>
          <g key={`${x}-${y}`}><circle cx={x} cy={y} r={size} className={styles.apCrater} /><path d={`M${x - size * .7},${y + size * .35}a${size},${size} 0 0,0 ${size * 1.4},0`} className={styles.apCraterShade} /></g>)}
      </>}
      <path d={`${ellipse(cx, cy, r + 2, r + 2)}${ellipse(cx - 26, cy - 24, r + 6, r + 6)}`} fillRule="evenodd" fill={`url(#${hatch})`} />
    </g>
    <path d={`M${cx - 52},${cy - 36}A${r - 12},${r - 12} 0 0,1 ${cx - 18},${cy - 60}`} className={styles.apGlint} />
    <circle cx={cx} cy={cy} r={r} className={styles.apOutline} />
    {world === 2 && <g transform={`rotate(${ring.tilt} ${cx} ${cy})`} clipPath={`url(#${front})`}>
      <path d={ringBand} fillRule="evenodd" className={styles.apRing} />
      <path d={ellipse(cx, cy, ring.gap[0], ring.gap[1])} className={styles.apRingLine} />
    </g>}
    {world === 3 && <g className={styles.apCompanion}>
      <ellipse cx={cx} cy={cy} rx="118" ry="40" transform={`rotate(-24 ${cx} ${cy})`} className={styles.apOrbit} />
      <circle cx="226" cy="56" r="9" className={styles.apMoonlet} />
    </g>}
  </svg>;
}
