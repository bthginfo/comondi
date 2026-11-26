"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import type { ComondiMotionSettings } from "@/lib/types";
import { defaultComondiMotion } from "@/lib/comondi-motion";
import styles from "./comondi.module.css";

type PlanetFocus = "overview" | "saturn" | "jupiter" | "moon";
const planets = ["saturn", "jupiter", "moon"] as const;
const planetNames = { overview: "", saturn: "Saturn", jupiter: "Jupiter", moon: "Mond" };

export function PlanetScene({ label = "Dreidimensionale Planetenwelt von co:mondi", poster = "/comondi/planet-poster.webp", motionSettings = defaultComondiMotion, ambientPaused = false, interactionHint, desktopHint }: {
  label?: string; poster?: string; motionSettings?: ComondiMotionSettings;
  ambientPaused?: boolean; interactionHint?: string; desktopHint?: string;
}) {
  const hintId = useId();
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(motionSettings);
  const scrollProgress = useRef(0);
  const externalPause = useRef(ambientPaused);
  const runtime = useRef<(() => void) | null>(null);
  const [focused, setFocused] = useState<PlanetFocus>("overview");
  const [ready, setReady] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    externalPause.current = ambientPaused;
    settingsRef.current = motionSettings;
    runtime.current?.();
  }, [ambientPaused, motionSettings]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setActivated(true);
      observer.disconnect();
    }, { rootMargin: "180px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = stage.current;
    const section = element?.closest<HTMLElement>('[data-section-type="comondi-hero"]');
    const visual = element?.parentElement;
    if (!element || !section || !visual) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = section.getBoundingClientRect();
      const start = Math.max(0, box.top + window.scrollY - innerHeight);
      const enabled = motionSettings.enabled && motionSettings.planetScroll && !preference.matches;
      const progress = enabled ? Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(box.height * 0.9, 1))) : 0;
      scrollProgress.current = progress;
      visual.style.setProperty("--cm-planet-progress", String(progress * motionSettings.parallaxStrength / 100));
      element.dataset.scrollProgress = progress.toFixed(3);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true }); window.addEventListener("resize", schedule, { passive: true }); preference.addEventListener("change", schedule); update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); preference.removeEventListener("change", schedule); visual.style.removeProperty("--cm-planet-progress"); };
  }, [motionSettings.enabled, motionSettings.planetScroll, motionSettings.parallaxStrength]);
  useEffect(() => {
    const element = host.current;
    if (!element || !activated) return;
    let disposed = false;
    let cleanup = () => {};
    void import("three").then(async THREE => {
      if (disposed) return;
      const mobile = matchMedia("(max-width: 760px)").matches;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: process.env.NODE_ENV === "development" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.15 : 1.6));
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.setClearColor(0x000000, 0);
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
      const overviewDistance = mobile ? 10.5 : 11.5;
      camera.position.set(0, 0, overviewDistance);
      const world = new THREE.Group();
      scene.add(world);
      scene.add(new THREE.AmbientLight(0x9bb8ff, 0.38));
      const sun = new THREE.DirectionalLight(0xddeaff, 3.2);
      sun.position.set(-5, 5, 6);
      scene.add(sun);
      const rim = new THREE.DirectionalLight(0x6a50d9, 0.6);
      rim.position.set(4, -2, -3);
      scene.add(rim);
      const loader = new THREE.TextureLoader();
      const textures: InstanceType<typeof THREE.Texture>[] = [];
      cleanup = () => { textures.forEach(texture => texture.dispose()); renderer.dispose(); renderer.domElement.remove(); };
      const getTexture = async (name: string) => {
        const texture = await loader.loadAsync(`/comondi/textures/${name}.webp`);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        textures.push(texture);
        return texture;
      };
      const [saturn, jupiter, moon] = await Promise.all([getTexture("saturn"), getTexture(mobile ? "jupiter-preview" : "jupiter"), getTexture(mobile ? "moon-preview" : "moon")]);
      if (disposed) { textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove(); return; }
      const sphere = new THREE.SphereGeometry(1, mobile ? 48 : 80, mobile ? 32 : 56);
      const main = new THREE.Group();
      main.rotation.z = -0.31;
      main.position.set(0.2, -0.12, 0);
      world.add(main);
      const planet = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ map: saturn, color: 0xb8c7ef, roughness: 0.94, metalness: 0.01 }));
      planet.scale.setScalar(1.68);
      main.add(planet);
      const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.715, mobile ? 40 : 64, mobile ? 28 : 48), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { glow: { value: new THREE.Color(0x6c83ff) } },
        vertexShader: "varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}",
        fragmentShader: "uniform vec3 glow;varying vec3 n;varying vec3 v;void main(){float a=pow(1.-max(dot(normalize(n),normalize(v)),0.),3.5);gl_FragColor=vec4(glow,a*.20);}",
      }));
      main.add(atmosphere);
      const ringMaterial = new THREE.ShaderMaterial({
        transparent: true, side: THREE.DoubleSide, depthWrite: false,
        vertexShader: "varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader: "varying vec3 p;void main(){float r=length(p.xy);float t=(r-2.02)/1.10;float bands=.5+.09*sin(r*104.)+.05*sin(r*251.)+.07*sin(r*17.);float edge=smoothstep(0.,.05,t)*(1.-smoothstep(.93,1.,t));float gap=1.-.86*exp(-pow((t-.56)*75.,2.));vec3 c=mix(vec3(.27,.30,.48),vec3(.77,.72,.83),bands);gl_FragColor=vec4(c,bands*edge*gap*.78);}",
      });
      const rings = new THREE.Mesh(new THREE.RingGeometry(2.02, 3.12, mobile ? 128 : 192), ringMaterial);
      rings.rotation.x = 1.12;
      rings.rotation.y = 0.13;
      main.add(rings);
      const small = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ map: jupiter, color: 0xddb4a3, roughness: 1 }));
      small.scale.setScalar(0.52); small.position.set(-2.35, 2.14, -1.3); small.rotation.z = 0.22;
      world.add(small);
      const satellite = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ map: moon, roughness: 1 }));
      satellite.scale.setScalar(0.27); satellite.position.set(2.2, -2.13, 1); world.add(satellite);
      // A deterministic sparse star field keeps first renders stable.
      const positions = new Float32Array((mobile ? 90 : 180) * 3);
      let seed = 42;
      const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let i = 0; i < positions.length; i += 3) { positions[i] = (random() - 0.5) * 22; positions[i + 1] = (random() - 0.5) * 16; positions[i + 2] = -3 - random() * 10; }
      const starsGeometry = new THREE.BufferGeometry();
      starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ size: 0.019, color: 0xc5d8ff, transparent: true, opacity: 0.4, sizeAttenuation: true }));
      scene.add(stars);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)");
      let visible = false, contextLost = false;
      let focus: PlanetFocus = "overview";
      const choose = (id: PlanetFocus) => {
        focus = id;
        setFocused(id);
        dirty = true;
        wake();
      };
      const cycle = (direction: number) => {
        const index = focus === "overview" ? 0 : planets.indexOf(focus);
        choose(planets[(index + direction + planets.length) % planets.length]);
      };
      const point = new THREE.Vector3(), look = new THREE.Vector3(), destination = new THREE.Vector3();
      const ray = new THREE.Raycaster(), pointerPosition = new THREE.Vector2();
      let hoverX = 0, hoverY = 0, yaw = 0, pitch = 0, dragOffset = 0;
      let frame = 0, last = 0, elapsed = 0, displayedScroll = 0, dirty = true;
      let lastFocus: PlanetFocus = "overview";
      const promoted = new Set<string>();
      const detail = (name: string, object: typeof small) => {
        if (!mobile || promoted.has(name)) return;
        promoted.add(name);
        void getTexture(name).then(texture => {
          if (disposed) { texture.dispose(); return; }
          object.material.map = texture; object.material.needsUpdate = true; dirty = true; wake();
        }).catch(() => {});
      };
      let drag: { id: number; x: number; y: number; startX: number; startY: number } | null = null;
      const pointerDown = (event: PointerEvent) => {
        if (!event.isPrimary || event.button !== 0) return;
        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
        element.setPointerCapture(event.pointerId); element.dataset.dragging = "true";
      };
      const pointer = (event: PointerEvent) => {
        const box = element.getBoundingClientRect();
        if (drag?.id === event.pointerId) {
          if (event.pointerType === "touch") {
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            dragOffset = Math.abs(dx) > Math.abs(dy) ? THREE.MathUtils.clamp(dx / box.width * 0.85, -0.34, 0.34) : 0;
          } else {
            yaw += (event.clientX - drag.x) / box.width * 2.8;
            pitch = THREE.MathUtils.clamp(pitch + (event.clientY - drag.y) / box.height * 1.2, -0.48, 0.48);
          }
          drag.x = event.clientX;
          drag.y = event.clientY;
        } else if (event.pointerType === "mouse") {
          hoverX = ((event.clientX - box.left) / box.width - 0.5) * 0.14;
          hoverY = ((event.clientY - box.top) / box.height - 0.5) * 0.1;
        }
        dirty = true;
        wake();
      };
      const pointerUp = (event: PointerEvent) => {
        if (drag?.id !== event.pointerId) return;
        const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
        if (event.type === "pointerup" && event.pointerType === "touch" && Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) cycle(dx < 0 ? 1 : -1);
        else if (event.type === "pointerup" && Math.hypot(dx, dy) < 7) {
          const box = element.getBoundingClientRect();
          pointerPosition.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
          ray.setFromCamera(pointerPosition, camera);
          const hit = ray.intersectObjects([planet, small, satellite])[0]?.object;
          if (hit) { const id = hit === planet ? "saturn" : hit === small ? "jupiter" : "moon"; choose(focus === id ? "overview" : id); }
        }
        drag = null; dragOffset = 0; dirty = true; wake();
        delete element.dataset.dragging;
        if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      };
      const leave = () => { hoverX = 0; hoverY = 0; dirty = true; wake(); };
      const keyboard = (event: KeyboardEvent) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") { yaw = 0; pitch = 0; choose("overview"); }
        else if (event.key === "ArrowLeft" || event.key === "ArrowRight") cycle(event.key === "ArrowLeft" ? -1 : 1);
        else pitch = THREE.MathUtils.clamp(pitch + (event.key === "ArrowUp" ? -0.12 : 0.12), -0.48, 0.48);
        dirty = true;
        wake();
      };
      let wheelDistance = 0, lastWheelSwitch = 0;
      const wheel = (event: WheelEvent) => {
        if (Math.abs(event.deltaX) < 2 || Math.abs(event.deltaX) < Math.abs(event.deltaY) * 1.4) return;
        event.preventDefault();
        if (performance.now() - lastWheelSwitch < 750) return;
        wheelDistance += event.deltaX;
        if (Math.abs(wheelDistance) > 60) { cycle(wheelDistance > 0 ? 1 : -1); wheelDistance = 0; lastWheelSwitch = performance.now(); }
      };
      element.addEventListener("wheel", wheel, { passive: false });
      element.addEventListener("pointerdown", pointerDown); element.addEventListener("pointermove", pointer);
      element.addEventListener("pointerup", pointerUp); element.addEventListener("pointercancel", pointerUp);
      element.addEventListener("pointerleave", leave); element.addEventListener("keydown", keyboard);
      function wake() {
        if (!frame && visible && !disposed && !document.hidden && !contextLost) frame = requestAnimationFrame(render);
      }
      const sync = () => {
        if (!visible || document.hidden || contextLost) {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
        } else {
          dirty = true;
          wake();
        }
      };
      const lost = (event: Event) => { event.preventDefault(); contextLost = true; setReady(false); sync(); };
      const restored = () => { contextLost = false; setReady(true); sync(); };
      renderer.domElement.addEventListener("webglcontextlost", lost); renderer.domElement.addEventListener("webglcontextrestored", restored);
      function render(now: number) {
        frame = 0;
        if (disposed || !visible || document.hidden || contextLost) return;
        if (last && now - last < 32) { wake(); return; }
        const delta = last ? Math.min((now - last) / 1000, 0.06) : 0.032;
        last = now;
        const settings = settingsRef.current;
        const ambient = !reduce.matches && !externalPause.current && settings.enabled;
        if (ambient) elapsed += delta;
        const strength = settings.parallaxStrength / 100 * (mobile ? 1.18 : 1);
        if (ambient) displayedScroll = THREE.MathUtils.damp(displayedScroll, settings.planetScroll ? scrollProgress.current : 0, 6, delta);
        const wantedYaw = yaw + hoverX + dragOffset + displayedScroll * strength * 0.9 + Math.sin(elapsed * 0.16) * 0.035;
        const wantedPitch = pitch + hoverY + displayedScroll * strength * 0.22;
        const turning = Math.abs(world.rotation.y - wantedYaw) + Math.abs(world.rotation.x - wantedPitch) > 0.0008;
        const smooth = reduce.matches || !settings.enabled ? 1 : 1 - Math.exp(-delta * 6);
        world.rotation.y = THREE.MathUtils.lerp(world.rotation.y, wantedYaw, smooth);
        world.rotation.x = THREE.MathUtils.lerp(world.rotation.x, wantedPitch, smooth);
        if (ambient) { planet.rotation.y += delta * 0.09; small.rotation.y += delta * 0.075; satellite.rotation.y += delta * 0.025; }
        main.rotation.z = -0.31 + displayedScroll * strength * 0.3;
        main.position.set(0.2 + displayedScroll * strength * 0.6, -0.12 + displayedScroll * strength * 0.85 + Math.sin(elapsed * 0.3) * 0.05, 0);
        small.position.set(-2.35 - displayedScroll * strength * 0.6, 2.14 + displayedScroll * strength * 0.22 + Math.sin(elapsed * 0.37) * 0.065, -1.3);
        satellite.position.set(2.2 + Math.sin(displayedScroll * 1.8) * strength * 0.48, -2.13 + displayedScroll * strength * 0.7, 1);
        world.updateMatrixWorld(true);
        const selected = focus;
        if (selected === "jupiter") detail("jupiter", small);
        if (selected === "moon") detail("moon", satellite);
        if (selected === "overview") point.set(0, 0, 0);
        else (selected === "saturn" ? planet : selected === "jupiter" ? small : satellite).getWorldPosition(point);
        const distance = selected === "saturn" ? overviewDistance - 0.7 : selected === "jupiter" ? 3.6 : selected === "moon" ? 2.05 : overviewDistance - displayedScroll * strength * 1.6;
        destination.copy(point); destination.z += distance;
        const travelling = camera.position.distanceTo(destination) + look.distanceTo(point) > 0.002;
        if (!ambient && !dirty && !turning && !travelling && selected === lastFocus) { last = 0; return; }
        camera.position.lerp(destination, smooth); look.lerp(point, smooth); camera.lookAt(look);
        renderer.render(scene, camera); dirty = false; lastFocus = selected;
        if (ambient || turning || travelling) wake();
        else last = 0;
      }
      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (!contextLost) renderer.render(scene, camera);
      };
      const resize = new ResizeObserver(size);
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { rootMargin: "60px" });
      resize.observe(element);
      observer.observe(element);
      document.addEventListener("visibilitychange", sync);
      reduce.addEventListener("change", sync);
      runtime.current = sync;
      size();
      setReady(true);
      cleanup = () => {
        runtime.current = null;
        document.removeEventListener("visibilitychange", sync);
        reduce.removeEventListener("change", sync);
        cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); element.removeEventListener("wheel", wheel); element.removeEventListener("pointerdown", pointerDown); element.removeEventListener("pointermove", pointer);
        element.removeEventListener("pointerup", pointerUp); element.removeEventListener("pointercancel", pointerUp);
        element.removeEventListener("pointerleave", leave); element.removeEventListener("keydown", keyboard);
        renderer.domElement.removeEventListener("webglcontextlost", lost); renderer.domElement.removeEventListener("webglcontextrestored", restored);
        scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Points) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } });
        textures.forEach(texture => texture.dispose()); renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { cleanup(); if (!disposed) setReady(false); });
    return () => { disposed = true; cleanup(); };
  }, [activated]);
  return <div ref={stage} className={styles.planetScene} data-cm-planet-stage="" data-cm-planet-ready={ready} data-cm-planet-focus={focused}>
    <div className={styles.planetViewport}>
      <img src={poster} srcSet={poster === "/comondi/planet-poster.webp" ? "/comondi/planet-poster-640.webp 640w, /comondi/planet-poster-800.webp 800w, /comondi/planet-poster.webp 1000w" : undefined}
        sizes="(max-width: 760px) 100vw, 46vw" width="1000" height="792" fetchPriority="high"
        alt="" aria-hidden="true" className={`${styles.planetPoster} ${ready ? styles.fallbackHidden : ""}`} />
      <div ref={host} className={styles.canvas} role="img" data-ready={ready} tabIndex={ready ? 0 : undefined}
        aria-label={label} aria-describedby={ready ? hintId : undefined} />
    </div>
    <div className={styles.planetMeta}>
      <span className={styles.planetName} role="status">{planetNames[focused]}</span>
      {ready && (interactionHint || desktopHint) && <span className={styles.planetHint}>
        <MoveHorizontal size={17} aria-hidden="true" />
        <span className={styles.planetTouchHint}>{interactionHint || desktopHint}</span>
        <span className={styles.planetDesktopHint}>{desktopHint || interactionHint}</span>
      </span>}
      <span id={hintId} className={styles.srOnly}>Mit den Pfeiltasten links und rechts den Planeten wechseln. Pos1 zeigt die Übersicht.</span>
    </div>
  </div>;
}
