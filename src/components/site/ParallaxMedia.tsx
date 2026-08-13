"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type ParallaxMediaProps = {
  children: ReactNode;
  className?: string;
  /** vertical travel as % of element height — keep small (5–8) */
  amount?: number;
  /** When false, render children without scroll scrub (default: desktop only). */
  enabled?: boolean;
};

function canParallax() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 1024px)").matches
  );
}

/**
 * Quiet spatial depth — desktop fine-pointer only.
 * On touch / reduced-motion: static fill, no ScrollTrigger.
 */
export function ParallaxMedia({
  children,
  className,
  amount = 7,
  enabled,
}: ParallaxMediaProps) {
  const frame = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const active = enabled ?? true;

  useGSAP(
    () => {
      if (!active || !canParallax() || !media.current || !frame.current) return;

      gsap.fromTo(
        media.current,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: {
            trigger: frame.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: frame, dependencies: [amount, active] },
  );

  return (
    <div
      ref={frame}
      className={`absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <div
        ref={media}
        data-velocity={active ? true : undefined}
        className="absolute inset-x-0 -top-[8%] h-[116%] w-full lg:will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
