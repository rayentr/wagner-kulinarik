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
};

/**
 * Type-only entrance: clipped rise. Never opacity — wrapping photos
 * in fade-in is what bleached images white over paper.
 * Do not wrap <Image> / video with this component.
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  stagger = false,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const targets = stagger ? el.children : el;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { yPercent: 0 });
        return;
      }

      const tween = gsap.fromTo(
        targets,
        { yPercent: 24 },
        {
          yPercent: 0,
          duration: 0.9,
          delay,
          ease: "lc.soft",
          stagger: stagger ? 0.08 : 0,
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
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
        gsap.set(targets, { clearProps: "transform" });
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={`overflow-hidden ${className ?? ""}`.trim()}>
      {children}
    </Tag>
  );
}
