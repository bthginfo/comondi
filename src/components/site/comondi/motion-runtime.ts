import type { ComondiMotionSettings } from "@/lib/types";

/** The content stays visible before hydration, during fast scrolling and when focused. */
export function installComondiMotion(root: HTMLElement, settings: ComondiMotionSettings) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Map<HTMLElement, Animation>();
  const revealed = new WeakSet<HTMLElement>();
  let observer: IntersectionObserver | undefined;
  let pointerFrame = 0;
  let currentCard: HTMLElement | null = null;

  function stopAnimations() {
    observer?.disconnect();
    for (const animation of animations.values()) animation.cancel();
    animations.clear();
  }

  function connect() {
    stopAnimations();
    if (!settings.enabled || !settings.textReveal || preference.matches) return;
    observer = new IntersectionObserver(entries => {
      for (const {isIntersecting, target} of entries) {
        if (!isIntersecting) continue;
        const element = target as HTMLElement;
        observer?.unobserve(element);
        revealed.add(element);
        if (element.contains(document.activeElement)) continue;
        const animation = element.animate(
          [{ opacity: .57, transform: "translateY(13px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: settings.revealDuration, easing: "cubic-bezier(.17,.86,.27,1)" },
        );
        animations.set(element, animation);
        animation.onfinish = () => animations.delete(element);
      }
    }, { threshold: 0.06 });
    const candidates = root.querySelectorAll<HTMLElement>('section[data-cm-entrance]:not([data-cm-entrance="none"]) :is(h2, h3, p, article, figure)');
    for (const element of candidates) {
      if (revealed.has(element) || element.closest('[role="tabpanel"], [data-cm-panel], form, [aria-hidden="true"], [hidden]')) continue;
      if (element.parentElement?.closest("article, figure")) continue;
      const box = element.getBoundingClientRect();
      if (box.height > 1 && box.width > 1 && box.top >= innerHeight) observer.observe(element);
    }
  }

  const cancelForFocus = (event: FocusEvent) => {
    for (const [element, animation] of animations) {
      if (!element.contains(event.target as Node)) continue;
      animation.cancel();
      animations.delete(element);
    }
  };
  const scroll = () => {
    const value = String(window.scrollY > 24);
    if (root.dataset.cmScrolled !== value) root.dataset.cmScrolled = value;
  };
  const resetCard = () => {
    cancelAnimationFrame(pointerFrame);
    if (!currentCard) return;
    currentCard.style.removeProperty("--cm-tilt-x");
    currentCard.style.removeProperty("--cm-tilt-y");
    currentCard = null;
  };
  const pointer = (event: PointerEvent) => {
    if (!settings.enabled || !settings.interactionFeedback || preference.matches || event.pointerType !== "mouse") return;
    const card = (event.target as Element).closest<HTMLElement>("article[data-cm-tilt]");
    if (card !== currentCard) { resetCard(); currentCard = card; }
    if (!card) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty("--cm-tilt-x", `${((event.clientX - bounds.left) / bounds.width - .5) * 2.4}deg`);
      card.style.setProperty("--cm-tilt-y", `${-((event.clientY - bounds.top) / bounds.height - .5) * 2}deg`);
    });
  };

  connect();
  scroll();
  preference.addEventListener("change", connect);
  window.addEventListener("scroll", scroll, { passive: true });
  root.addEventListener("focusin", cancelForFocus);
  root.addEventListener("pointermove", pointer, { passive: true });
  root.addEventListener("pointerleave", resetCard);
  return () => {
    stopAnimations();
    resetCard();
    preference.removeEventListener("change", connect);
    window.removeEventListener("scroll", scroll);
    root.removeEventListener("focusin", cancelForFocus);
    root.removeEventListener("pointermove", pointer);
    root.removeEventListener("pointerleave", resetCard);
  };
}
