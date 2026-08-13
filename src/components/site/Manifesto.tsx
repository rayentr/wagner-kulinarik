"use client";

import { useRef } from "react";
import {
  gsap,
  SplitText,
  useGSAP,
  prefersReducedMotion,
} from "@/lib/gsap";

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = headline.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "manifesto-line",
      });

      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.15,
        stagger: 0.1,
        ease: "lc.luxury",
        scrollTrigger: {
          trigger: root.current,
          start: "top 72%",
          once: true,
        },
      });

      gsap.from("[data-manifesto]", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.12,
        ease: "lc.soft",
        scrollTrigger: {
          trigger: root.current,
          start: "top 72%",
          once: true,
        },
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-paper px-6 py-24 text-ink md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-12 border-t border-ink/20 pt-6 md:grid-cols-[.45fr_1.55fr] md:gap-20">
          <div className="flex justify-between md:block">
            <p data-manifesto className="label text-accent">
              01 / Haltung
            </p>
            <span
              data-manifesto
              className="font-display text-6xl font-medium leading-none text-brass/45 md:mt-16 md:block md:text-[9rem]"
            >
              &amp;
            </span>
          </div>
          <div>
            <h2
              ref={headline}
              data-cursor="text"
              className="max-w-[11ch] font-display text-[clamp(3.2rem,7.5vw,8rem)] font-medium leading-[.92] tracking-[-.045em] text-balance"
            >
              Wenn die Reden enden, beginnt der Moment.
            </h2>
            <div className="mt-12 grid gap-8 md:ml-[18%] md:grid-cols-[1fr_auto] md:items-end">
              <p
                data-manifesto
                className="max-w-[45ch] font-body text-lg leading-relaxed text-ink/68"
              >
                Der Tisch ist die Pause einer Feier — der Augenblick, in dem
                Gäste zusammenkommen, lächeln und sich erinnern. Wir gestalten
                ihn mit Handwerk, Präzision und Verlässlichkeit.
              </p>
              <p
                data-manifesto
                className="label border-l border-accent pl-4 text-ink/55"
              >
                Berlin &amp; Umland
                <br />
                Anfahrt nach Absprache
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
