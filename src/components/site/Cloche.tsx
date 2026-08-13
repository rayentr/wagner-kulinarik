"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type ClocheProps = {
  children: ReactNode;
  className?: string;
  /** Lid up — the dish is served. */
  open?: boolean;
};

/**
 * Dish cover — clip lifts when open. Photograph never fades.
 * GSAP owns clip-path after mount (no inline toggle — that would jump the lid).
 */
export function Cloche({ children, className = "", open = false }: ClocheProps) {
  const root = useRef<HTMLDivElement>(null);
  const lid = useRef<HTMLDivElement>(null);
  const primed = useRef(false);

  useGSAP(
    () => {
      const cover = lid.current;
      if (!cover) return;

      const next = open ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)";

      if (!primed.current || prefersReducedMotion()) {
        gsap.set(cover, { clipPath: next });
        primed.current = true;
        return;
      }

      gsap.to(cover, {
        clipPath: next,
        duration: 0.72,
        ease: "lc.soft",
        overwrite: "auto",
      });
    },
    { scope: root, dependencies: [open], revertOnUpdate: false },
  );

  return (
    <div
      ref={root}
      className={`relative overflow-hidden bg-night-soft ${className}`}
    >
      <div ref={lid} className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
