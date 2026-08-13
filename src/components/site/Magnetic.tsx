"use client";

import { useRef, type ReactNode } from "react";
import { canUsePointerEffects, gsap, useGSAP } from "@/lib/gsap";

type MagneticProps = {
  children: ReactNode;
  /** Pull strength in px at edge of hit area. Default 28. */
  strength?: number;
};

/**
 * Soft magnetic pull for primary CTAs. Fine pointer only; no-ops on touch / reduced motion.
 */
export function Magnetic({ children, strength = 28 }: MagneticProps) {
  const wrap = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = wrap.current;
      if (!el || !canUsePointerEffects()) return;

      const target = el.firstElementChild as HTMLElement | null;
      if (!target) return;

      const xTo = gsap.quickTo(target, "x", {
        duration: 0.55,
        ease: "lc.soft",
      });
      const yTo = gsap.quickTo(target, "y", {
        duration: 0.55,
        ease: "lc.soft",
      });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        gsap.set(target, { x: 0, y: 0 });
      };
    },
    { scope: wrap, dependencies: [strength] },
  );

  return (
    <span ref={wrap} className="inline-block will-change-transform">
      {children}
    </span>
  );
}
