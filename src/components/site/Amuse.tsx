"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis-ref";
import { serve } from "@/lib/amuse";

const KEY = "wk-amuse";

/**
 * Amuse-bouche — a cloche of paper lifts. Once per visit. Not a spinner.
 */
export function Amuse() {
  const root = useRef<HTMLDivElement>(null);
  const lid = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const cover = lid.current;
      const line = word.current;
      if (!el || !cover || !line) return;

      const skip =
        prefersReducedMotion() ||
        (typeof sessionStorage !== "undefined" &&
          sessionStorage.getItem(KEY) === "1");

      if (skip) {
        gsap.set(el, { display: "none" });
        getLenis()?.start();
        serve();
        return;
      }

      getLenis()?.stop();

      gsap.set(cover, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(line, { yPercent: 110 });

      const tl = gsap.timeline({
        defaults: { ease: "lc.luxury" },
        onComplete: () => {
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            /* private mode */
          }
          getLenis()?.start();
          serve();
          gsap.set(el, { display: "none" });
        },
      });

      tl.to(line, { yPercent: 0, duration: 0.85 }, 0.15).to(
        cover,
        { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "lc.soft" },
        0.95,
      );

      return () => {
        tl.kill();
        getLenis()?.start();
        serve();
      };
    },
    { scope: root },
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
    } catch {
      return;
    }
    getLenis()?.stop();
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[80] bg-paper"
      aria-hidden
    >
      <div ref={lid} className="absolute inset-0 flex items-end bg-paper px-8 pb-16 md:px-16 md:pb-20">
        <div className="overflow-hidden">
          <p
            ref={word}
            className="font-display text-[clamp(2.4rem,6vw,5rem)] font-medium italic leading-none tracking-[-.04em] text-ink"
          >
            Einen Moment.
          </p>
        </div>
      </div>
    </div>
  );
}
