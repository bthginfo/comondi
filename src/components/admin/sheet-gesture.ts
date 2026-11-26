"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type SheetDetent = "medium" | "large";

/**
 * iOS-like bottom sheet on phones: drag the header down to close (or to the medium height),
 * drag it up for the large height. Buttons inside the header keep their own clicks.
 */
export function useSheetGesture(onClose: () => void) {
  const [detent, setDetent] = useState<SheetDetent>("medium");
  const drag = useRef<{ y: number; sheet: HTMLElement; id: number; dy: number } | null>(null);
  function reset() {
    const current = drag.current;
    drag.current = null;
    if (!current) return 0;
    current.sheet.style.transform = "";
    current.sheet.style.transition = "";
    return current.dy;
  }
  const handlers = {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (event.pointerType === "mouse" || (event.target as Element).closest("button, a, input, select, textarea")) return;
      const sheet = event.currentTarget.closest<HTMLElement>("[data-sheet]");
      if (!sheet || !matchMedia("(max-width: 760px)").matches) return;
      drag.current = { y: event.clientY, sheet, id: event.pointerId, dy: 0 };
      event.currentTarget.setPointerCapture(event.pointerId);
      sheet.style.transition = "none";
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      const current = drag.current;
      if (!current || current.id !== event.pointerId) return;
      current.dy = event.clientY - current.y;
      current.sheet.style.transform = `translateY(${Math.max(current.dy, -48)}px)`;
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      if (!drag.current || drag.current.id !== event.pointerId) return;
      const dy = reset();
      if (dy > 90) { if (detent === "large") setDetent("medium"); else onClose(); }
      else if (dy < -40) setDetent("large");
    },
    onPointerCancel() { reset(); },
  };
  return { detent, setDetent, handlers };
}
