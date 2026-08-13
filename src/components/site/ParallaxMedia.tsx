"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type ParallaxMediaProps = {
  children: ReactNode;
  className?: string;
  /** vertical travel as % of element height — keep small (5–8) */
  amount?: number;
};

/**
 * Quiet spatial depth: media drifts slower than scroll.
 * Parent should be `relative overflow-hidden` with a defined size.
 * Children should fill the inner layer (e.g. next/image with fill).
 */
export function ParallaxMedia({
  children,
  className,
  amount = 7,
}: ParallaxMediaProps) {
  const frame = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce || !media.current || !frame.current) return;

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
    { scope: frame, dependencies: [amount] },
  );

  return (
    <div ref={frame} className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <div
        ref={media}
        data-velocity
        className="absolute inset-x-0 -top-[8%] h-[116%] w-full will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
