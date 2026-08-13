"use client";

import { useRef, type ReactNode } from "react";
import {
  USE_SCROLL_SMOOTHER,
  canUseScrollSmoother,
  ScrollSmoother,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Optional ScrollSmoother — desktop only.
 * When disabled (default), children render UNWRAPPED so ScrollTrigger
 * pins are not trapped inside a will-change:transform containing block.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  const enabled = USE_SCROLL_SMOOTHER;

  useGSAP(
    () => {
      if (!enabled || !canUseScrollSmoother()) return;
      if (!wrapper.current || !content.current) return;

      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current,
        content: content.current,
        smooth: 0.85,
        effects: false,
        smoothTouch: false,
        ignoreMobileResize: true,
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        smoother.kill();
      };
    },
    { scope: wrapper, dependencies: [enabled] },
  );

  // Critical: no wrapper / no will-change when smoother is off — pins need viewport-fixed.
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div id="smooth-wrapper" ref={wrapper} className="smooth-wrapper">
      <div id="smooth-content" ref={content} className="smooth-content is-smoothing">
        {children}
      </div>
    </div>
  );
}
