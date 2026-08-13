"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis-ref";

/**
 * Lenis on the window scroller — pins stay native (no transform wrapper).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.09,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    });

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    const boot = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.clearTimeout(boot);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
