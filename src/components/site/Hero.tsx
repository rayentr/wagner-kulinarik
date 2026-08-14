"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { SplitText } from "gsap/SplitText";
import {
  gsap,
  useGSAP,
  prefersReducedMotion,
  scrollToTarget,
} from "@/lib/gsap";
import { useLocale, useT } from "@/lib/locale";
import { isServed, onServed } from "@/lib/amuse";
import { AmbientVideo } from "./AmbientVideo";
import { Magnetic } from "./Magnetic";
import { HeroGrain } from "./HeroGrain";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

function go(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  scrollToTarget(href);
}

export function Hero() {
  const t = useT();
  const { locale } = useLocale();
  const root = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);
  const words = t.hero.words;

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const WORDS = [...words];

      if (reduce) {
        gsap.set("[data-hero]", { y: 0, scale: 1, filter: "none" });
        gsap.set("[data-hero-line]", { scaleX: 1 });
        gsap.set("[data-hero-photo]", { scale: 1 });
        if (wordRef.current) wordRef.current.textContent = WORDS[0];
        return;
      }

      const brand = brandRef.current;
      let split: SplitText | null = null;
      if (brand) {
        split = SplitText.create(brand, {
          type: "lines,words",
          mask: "lines",
          linesClass: "hero-line",
          wordsClass: "hero-word",
        });
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: "lc.luxury" } });

      tl.from("[data-hero-photo]", {
        scale: 1.16,
        duration: 1.7,
      });

      if (split?.words?.length) {
        tl.from(
          split.words,
          {
            yPercent: 110,
            duration: 1.05,
            stagger: 0.05,
            ease: "lc.luxury",
          },
          "-=1.1",
        );
      } else {
        tl.from("[data-hero='brand']", { y: 40, duration: 1.15 }, "-=0.85");
      }

      tl.from("[data-hero='tag']", { y: 22, duration: 0.85, ease: "lc.soft" }, "-=0.55")
        .from(
          "[data-hero-line]",
          { scaleX: 0, duration: 0.95, ease: "lc.soft" },
          "-=0.45",
        )
        .from("[data-hero='word']", { y: 10, duration: 0.55, ease: "lc.soft" }, "-=0.25")
        .from("[data-hero='cta']", { y: 16, duration: 0.65, ease: "lc.soft" }, "-=0.25");

      const word = wordRef.current;
      if (word) {
        word.textContent = WORDS[0];
        const cycle = gsap.timeline({ delay: 2.6 });
        [1, 2, 0].forEach((i) => {
          cycle
            .to(word, { y: -10, duration: 0.35, ease: "power2.in" })
            .add(() => {
              word.textContent = WORDS[i];
            })
            .fromTo(word, { y: 10 }, { y: 0, duration: 0.4, ease: "lc.soft" })
            .to({}, { duration: 0.9 });
        });
      }

      gsap.to("[data-hero-glow]", {
        opacity: 0.55,
        scale: 1.06,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to("[data-hero-photo]", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      const play = () => {
        tl.play();
      };
      if (isServed()) play();
      const off = onServed(play);

      return () => {
        off();
        split?.revert();
      };
    },
    { scope: root, dependencies: [locale, words] },
  );

  useEffect(() => {
    const warm = () => {
      void import("@/components/site/Inquiry");
    };
    const ric = typeof window.requestIdleCallback === "function";
    const idle = ric
      ? window.requestIdleCallback(warm, { timeout: 2200 })
      : window.setTimeout(warm, 1800);
    return () => {
      if (ric) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return (
    <section
      id="top"
      ref={root}
      className="relative min-h-dvh overflow-hidden bg-night"
    >
      <div className="absolute inset-0 overflow-hidden" data-cursor="media">
        <div
          data-hero-photo
          className="absolute inset-x-0 -top-[6%] h-[112%] w-full will-change-transform"
        >
          <AmbientVideo
            src="/video/ambient-table.mp4"
            videoOnly
            lazy={false}
            preload="metadata"
            position="58% 42%"
          />
        </div>
      </div>
      <HeroGrain />

      <div
        data-hero-veil
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(16,13,11,.92)_0%,rgba(16,13,11,.68)_34%,rgba(16,13,11,.18)_62%,rgba(16,13,11,.28)_100%)]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/75 via-transparent to-night/25" />

      <div
        data-hero-glow
        className="pointer-events-none absolute left-[18%] top-[48%] h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(198,162,109,0.38) 0%, rgba(198,162,109,0.08) 45%, transparent 70%)",
        }}
      />

      <div
        data-hero-copy
        className="relative z-10 flex min-h-dvh max-w-[1500px] flex-col justify-end px-6 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] pt-36 will-change-transform md:px-12 md:pb-16 lg:px-20"
      >
        <p data-hero="tag" className="label mb-5 text-ivory/55">
          {t.hero.eyebrow}
        </p>
        <h1
          ref={brandRef}
          data-hero="brand"
          data-cursor="text"
          className="max-w-[14ch] font-display font-medium leading-[0.88] tracking-[-0.05em] text-ivory drop-shadow-[0_18px_40px_rgba(0,0,0,.35)]"
          style={{ fontSize: "clamp(2.8rem, 7.2vw, 6.2rem)" }}
        >
          {t.hero.headline}
        </h1>

        <p
          data-hero="tag"
          className="mt-8 max-w-[40ch] font-body text-lg leading-relaxed text-ivory/80 md:ml-[12vw] md:text-xl"
        >
          {t.hero.support}
        </p>

        <div className="mt-8 flex items-center gap-4 md:ml-[12vw]">
          <span
            data-hero-line
            className="label origin-left border-b border-brass pb-2 text-brass"
            style={{ minWidth: "8ch" }}
          >
            <span data-hero="word" ref={wordRef}>
              {words[0]}
            </span>
          </span>
        </div>

        <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:items-baseline md:ml-[12vw]">
          <Magnetic strength={22}>
            <a
              data-hero="cta"
              data-cursor="cta"
              href="#anfrage"
              onClick={(e) => go(e, "#anfrage")}
              onPointerEnter={() => {
                void import("@/components/site/Inquiry");
              }}
              className="inline-flex min-h-11 items-center bg-accent px-7 py-3.5 font-sans text-sm font-medium text-paper transition-[background-color] duration-300 hover:bg-berry-bright"
            >
              {t.hero.ctaPlan}
            </a>
          </Magnetic>
        </div>
      </div>

      <p className="label absolute bottom-7 right-6 z-10 hidden origin-bottom-right -rotate-90 text-ivory/45 md:block">
        {t.hero.side}
      </p>
    </section>
  );
}
