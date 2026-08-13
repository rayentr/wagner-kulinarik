"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { canUsePointerEffects, gsap } from "@/lib/gsap";

type CursorState =
  | "default"
  | "link"
  | "cta"
  | "media"
  | "text"
  | "explore"
  | "play"
  | "drag"
  | "prev"
  | "next"
  | "hide";

const LABELS: Partial<Record<CursorState, string>> = {
  cta: "Anfrage",
  media: "Sehen",
  explore: "Entdecken",
  play: "Play",
  drag: "Ziehen",
  prev: "Zurück",
  next: "Weiter",
};

/**
 * Contextual site cursor — fine pointer only.
 * Drive states with data-cursor on interactive nodes.
 */
function subscribePointer(onChange: () => void) {
  const fine = window.matchMedia("(pointer: fine)");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  fine.addEventListener("change", onChange);
  motion.addEventListener("change", onChange);
  return () => {
    fine.removeEventListener("change", onChange);
    motion.removeEventListener("change", onChange);
  };
}

export function SiteCursor() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const enabled = useSyncExternalStore(
    subscribePointer,
    canUsePointerEffects,
    () => false,
  );

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("has-site-cursor");

    const ringEl = ring.current;
    const dotEl = dot.current;
    const labelEl = label.current;
    const rootEl = root.current;
    if (!ringEl || !dotEl || !labelEl || !rootEl) return;

    const xTo = gsap.quickTo(ringEl, "x", { duration: 0.45, ease: "lc.soft" });
    const yTo = gsap.quickTo(ringEl, "y", { duration: 0.45, ease: "lc.soft" });
    const dxTo = gsap.quickTo(dotEl, "x", { duration: 0.18, ease: "lc.snap" });
    const dyTo = gsap.quickTo(dotEl, "y", { duration: 0.18, ease: "lc.snap" });
    const sxTo = gsap.quickTo(ringEl, "scaleX", {
      duration: 0.28,
      ease: "lc.snap",
    });
    const syTo = gsap.quickTo(ringEl, "scaleY", {
      duration: 0.28,
      ease: "lc.snap",
    });

    let state: CursorState = "default";
    let visible = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;

    const applyState = (next: CursorState) => {
      if (next === state) return;
      state = next;
      rootEl.dataset.state = next;
      const text = LABELS[next] ?? "";
      labelEl.textContent = text;
      gsap.to(labelEl, {
        opacity: text ? 1 : 0,
        duration: 0.25,
        ease: "lc.snap",
      });
    };

    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to(rootEl, { opacity: 1, duration: 0.35, ease: "lc.soft" });
    };

    const hide = () => {
      visible = false;
      gsap.to(rootEl, { opacity: 0, duration: 0.25, ease: "power2.in" });
      sxTo(1);
      syTo(1);
    };

    const onMove = (e: PointerEvent) => {
      show();
      xTo(e.clientX);
      yTo(e.clientY);
      dxTo(e.clientX);
      dyTo(e.clientY);

      const now = performance.now();
      if (lastT > 0) {
        const dt = Math.max(12, now - lastT);
        const speed = Math.min(
          1,
          Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt / 1.1,
        );
        sxTo(1 + speed * 0.45);
        syTo(1 - speed * 0.18);
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    const resolveState = (el: Element | null): CursorState => {
      const host = el?.closest?.("[data-cursor]") as HTMLElement | null;
      if (!host) return "default";
      const v = host.getAttribute("data-cursor") as CursorState | null;
      return v ?? "default";
    };

    const onOver = (e: PointerEvent) => {
      applyState(resolveState(e.target as Element));
    };

    const onLeave = () => hide();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-site-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={root}
      className="site-cursor pointer-events-none fixed left-0 top-0 z-[100] opacity-0 mix-blend-difference"
      data-state="default"
      aria-hidden
    >
      <div
        ref={ring}
        className="site-cursor-ring absolute flex h-10 w-10 items-center justify-center rounded-full border border-ivory/80 will-change-transform"
        style={{ marginLeft: "-1.25rem", marginTop: "-1.25rem" }}
      >
        <span
          ref={label}
          className="site-cursor-label label pointer-events-none absolute opacity-0 text-[0.55rem] tracking-[0.18em] text-ivory"
        />
      </div>
      <div
        ref={dot}
        className="site-cursor-dot absolute h-2 w-2 rounded-full bg-ivory"
        style={{ marginLeft: "-0.25rem", marginTop: "-0.25rem" }}
      />
    </div>
  );
}
