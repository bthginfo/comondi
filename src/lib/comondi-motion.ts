import type { ComondiMotionSettings } from "./types";

export const defaultComondiMotion: ComondiMotionSettings = {
  enabled: true,
  background: true,
  planetScroll: true,
  textReveal: true,
  interactionFeedback: true,
  intensity: 45,
  speed: 48,
  parallaxStrength: 58,
  revealDuration: 850,
  starDensity: "balanced",
};

export const comondiDesignNames = { kosmos: "Kosmos", atlas: "Atlas" } as const;

export function comondiMotion(settings?: Partial<ComondiMotionSettings>): ComondiMotionSettings {
  return { ...defaultComondiMotion, ...settings };
}

export const comondiPlanetItems = [
  { id: "planet-interaction-hint", title: "Wischen & entdecken", text: "" },
];
