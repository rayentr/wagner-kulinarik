"use client";

import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import {
  gsap,
  useGSAP,
  prefersReducedMotion,
} from "@/lib/gsap";
import { useLocale, useT } from "@/lib/locale";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export function Manifesto() {
  const t = useT();
  const { locale } = useLocale();
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = headline.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { yPercent: 0 });
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

      gsap.fromTo(
        el,
        { fontVariationSettings: '"opsz" 24' },
        {
          fontVariationSettings: '"opsz" 144',
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 35%",
            scrub: true,
          },
        },
      );

      return () => split.revert();
    },
    { scope: root, dependencies: [locale, t.manifesto.headline] },
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-paper px-6 py-14 text-ink md:px-12 md:py-16"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-12 border-t border-ink/20 pt-6 md:grid-cols-[.45fr_1.55fr] md:gap-20">
          <p data-manifesto className="label text-ink/45">
            {t.manifesto.eyebrow}
          </p>
          <div>
            <h2
              ref={headline}
              data-cursor="text"
              className="max-w-[14ch] font-display text-[clamp(3.2rem,7.5vw,8rem)] font-medium leading-[.92] tracking-[-.045em] text-balance"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {t.manifesto.headline}
            </h2>
            <div className="mt-12 grid gap-8 md:ml-[18%] md:grid-cols-[1fr_auto] md:items-end">
              <p
                data-manifesto
                className="max-w-[45ch] font-sans text-lg leading-relaxed text-ink/68"
              >
                {t.manifesto.body}
              </p>
              <p
                data-manifesto
                className="label border-l border-ink/20 pl-4 whitespace-pre-line text-ink/45"
              >
                {t.manifesto.aside}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
