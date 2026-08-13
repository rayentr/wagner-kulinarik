"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** delay in seconds */
  delay?: number;
  /** stagger direct children instead of the element itself */
  stagger?: boolean;
  y?: number;
};

/**
 * Quiet-luxury entrance: soft fade + short rise, once, on scroll.
 * Completes immediately if already past (pin refresh safe).
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  stagger = false,
  y = 32,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(stagger ? el.children : el, { opacity: 1, y: 0 });
        return;
      }

      const targets = stagger ? el.children : el;

      const tween = gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "lc.soft",
          stagger: stagger ? 0.08 : 0,
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
            // After pin spacers remount, finish if we already scrolled past
            onRefresh(self) {
              if (self.progress === 1 || self.isActive) {
                self.animation?.progress(1);
              }
            },
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(targets, { clearProps: "opacity,transform,visibility" });
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
