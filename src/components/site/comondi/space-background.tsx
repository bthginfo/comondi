"use client";

import { useEffect, useRef } from "react";
import type { ComondiMotionSettings } from "@/lib/types";
import motion from "./motion.module.css";

export function SpaceBackground({ settings, paused, editable }: { settings: ComondiMotionSettings; paused: boolean; editable?: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const runtime = useRef<{ resume: () => void } | null>(null);
  useEffect(() => {
    const element = layer.current;
    const surface = canvas.current;
    const context = surface?.getContext("2d", { alpha: true });
    if (!element || !surface || !context || !settings.background) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1, height = 1, scale = 1, frame = 0, last = 0, elapsed = 0;
    let targetScroll = window.scrollY, scroll = targetScroll, pointerX = 0, pointerY = 0, x = 0, y = 0;
    let seed = 1907;
    const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
    const count = settings.starDensity === "sparse" ? 64 : settings.starDensity === "dense" ? 170 : 108;
    const stars = Array.from({ length: count }, () => ({ x: random(), y: random(), radius: 0.35 + random() * 0.85, depth: 0.22 + random() * 0.78, phase: random() * Math.PI * 2 }));
    const moving = () => settings.enabled && !pausedRef.current && !editable && !preference.matches;
    function paint() {
      context!.setTransform(scale, 0, 0, scale, 0, 0);
      context!.clearRect(0, 0, width, height);
      const speed = 0.25 + settings.speed / 75;
      const intensity = 0.35 + settings.intensity / 160;
      for (const star of stars) {
        const sx = ((star.x * width + elapsed * speed * star.depth + x * star.depth) % width + width) % width;
        const sy = ((star.y * height + elapsed * speed * 0.18 - scroll * 0.055 * star.depth + y * star.depth) % height + height) % height;
        const glow = 0.7 + Math.sin(elapsed * 0.28 + star.phase) * 0.3;
        context!.globalAlpha = (0.16 + star.depth * 0.38) * glow * intensity;
        context!.fillStyle = star.depth > 0.7 ? "#d9c5ef" : "#a5c5ef";
        context!.beginPath(); context!.arc(sx, sy, star.radius, 0, Math.PI * 2); context!.fill();
      }
      context!.globalAlpha = 1;
    }
    function tick(now: number) {
      frame = 0;
      if (!moving() || document.hidden) return;
      if (!last || now - last > 48) {
        const delta = last ? Math.min((now - last) / 1000, 0.08) : 0;
        last = now; elapsed += delta;
        scroll += (targetScroll - scroll) * (1 - Math.exp(-delta * 5));
        x += (pointerX - x) * 0.06; y += (pointerY - y) * 0.06;
        paint();
      }
      frame = requestAnimationFrame(tick);
    }
    function resume() { cancelAnimationFrame(frame); frame = 0; last = 0; paint(); if (moving() && !document.hidden) frame = requestAnimationFrame(tick); }
    const resize = new ResizeObserver(() => {
      const box = element.getBoundingClientRect(); width = Math.max(box.width, 1); height = Math.max(box.height, 1);
      scale = Math.min(1, 1400 / width); surface.width = Math.round(width * scale); surface.height = Math.round(height * scale); paint();
    });
    resize.observe(element);
    const onScroll = () => { targetScroll = window.scrollY; };
    const onPointer = (event: PointerEvent) => { if (event.pointerType !== "mouse") return; pointerX = (event.clientX / innerWidth - 0.5) * 9; pointerY = (event.clientY / innerHeight - 0.5) * 7; };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", resume); preference.addEventListener("change", resume); runtime.current = { resume }; resume();
    return () => { runtime.current = null; cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onPointer); document.removeEventListener("visibilitychange", resume); preference.removeEventListener("change", resume); };
  }, [settings.enabled, settings.background, settings.intensity, settings.speed, settings.starDensity, editable]);
  useEffect(() => { pausedRef.current = paused; runtime.current?.resume(); }, [paused]);
  if (!settings.background) return null;
  return <div ref={layer} className={motion.spaceBackground} data-paused={!settings.enabled || paused || editable ? "true" : undefined} aria-hidden="true">
    <div className={motion.nebulaBlue} /><div className={motion.nebulaPink} /><div className={motion.nebulaDeep} />
    <div className={motion.distantOrbit} /><div className={motion.distantOrbitSecond} />
    <canvas ref={canvas} className={motion.starfield} />
  </div>;
}
