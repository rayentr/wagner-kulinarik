"use client";

import { useRef, type MouseEvent } from "react";
import {
  gsap,
  SplitText,
  useGSAP,
  prefersReducedMotion,
  scrollToTarget,
} from "@/lib/gsap";
import { AmbientVideo } from "./AmbientVideo";
import { Magnetic } from "./Magnetic";

const WORDS = ["MOMENT", "MENÜ", "MEMORY"];

function go(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  scrollToTarget(href);
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      if (reduce) {
        gsap.set("[data-hero]", { opacity: 1, y: 0, scale: 1, filter: "none" });
        gsap.set("[data-hero-line]", { scaleX: 1 });
        return;
      }

      const brand = brandRef.current;
      let split: SplitText | null = null;
      if (brand) {
        split = SplitText.create(brand, {
          type: "lines,chars",
          mask: "lines",
          linesClass: "hero-line",
          charsClass: "hero-char",
        });
      }

      const tl = gsap.timeline({ defaults: { ease: "lc.luxury" } });

      tl.from("[data-hero-photo]", {
        scale: 1.08,
        opacity: 0,
        duration: 1.7,
      })
        .from(
          "[data-hero-veil]",
          { opacity: 0, duration: 1.1 },
          "-=1.25",
        );

      if (split?.chars?.length) {
        tl.from(
          split.chars,
          {
            yPercent: 110,
            opacity: 0,
            duration: 1.05,
            stagger: 0.022,
            ease: "lc.luxury",
          },
          "-=0.9",
        );
      } else {
        tl.from(
          "[data-hero='brand']",
          { y: 40, opacity: 0, duration: 1.15 },
          "-=0.85",
        );
      }

      tl.from(
        "[data-hero='tag']",
        { y: 22, opacity: 0, duration: 0.85, ease: "lc.soft" },
        "-=0.55",
      )
        .from(
          "[data-hero-line]",
          { scaleX: 0, opacity: 0, duration: 0.95, ease: "lc.soft" },
          "-=0.45",
        )
        .from(
          "[data-hero='word']",
          { y: 10, opacity: 0, duration: 0.55, ease: "lc.soft" },
          "-=0.25",
        )
        .from(
          "[data-hero='cta']",
          { y: 16, opacity: 0, duration: 0.65, stagger: 0.1, ease: "lc.soft" },
          "-=0.25",
        );

      const word = wordRef.current;
      if (word) {
        const cycle = gsap.timeline({ delay: 2.6 });
        [1, 2, 0].forEach((i) => {
          cycle
            .to(word, { opacity: 0, y: -8, duration: 0.35, ease: "power2.in" })
            .add(() => {
              word.textContent = WORDS[i];
            })
            .to(word, { opacity: 1, y: 0, duration: 0.4, ease: "lc.soft" })
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
      gsap.to("[data-hero-copy]", {
        yPercent: -4,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      return () => {
        split?.revert();
      };
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      className="grain relative min-h-[100svh] overflow-hidden bg-night"
    >
      <div className="absolute inset-0 overflow-hidden" data-cursor="media">
        <div
          data-hero-photo
          data-velocity
          className="absolute inset-x-0 -top-[6%] h-[112%] w-full will-change-transform"
        >
          <AmbientVideo
            src="/video/ambient-table.mp4"
            videoOnly
            position="58% 42%"
          />
        </div>
      </div>

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
        className="relative z-10 flex min-h-[100svh] max-w-[1500px] flex-col justify-end px-6 pb-24 pt-36 will-change-transform md:px-12 md:pb-16 lg:px-20"
      >
        <p data-hero="tag" className="label mb-5 text-brass">
          Catering &amp; Events · Berlin
        </p>
        <h1
          ref={brandRef}
          data-hero="brand"
          data-cursor="text"
          className="max-w-[12ch] font-display font-medium leading-[0.78] tracking-[-0.06em] text-ivory drop-shadow-[0_18px_40px_rgba(0,0,0,.35)]"
          style={{ fontSize: "clamp(3.4rem, 9.5vw, 8.5rem)" }}
        >
          <span className="block">Wagner</span>
          <span className="block italic">Kulinarik</span>
        </h1>

        <p
          data-hero="tag"
          className="mt-8 max-w-[34ch] font-body text-lg leading-relaxed text-ivory/80 md:ml-[18vw] md:text-xl"
        >
          Momente, die man schmecken kann.
        </p>

        <div className="mt-8 flex items-center gap-4 md:ml-[18vw]">
          <span
            data-hero-line
            className="label origin-left border-b border-brass pb-2 text-brass"
            style={{ minWidth: "7ch" }}
          >
            <span data-hero="word" ref={wordRef}>
              MOMENT
            </span>
          </span>
        </div>

        <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center md:ml-[18vw]">
          <Magnetic strength={22}>
            <a
              data-hero="cta"
              data-cursor="cta"
              href="#anfrage"
              onClick={(e) => go(e, "#anfrage")}
              className="inline-block bg-accent px-7 py-3.5 font-sans text-sm font-medium text-paper transition-[background-color] duration-300 hover:bg-[#ca5138]"
            >
              Verfügbarkeit prüfen
            </a>
          </Magnetic>
          <Magnetic strength={14}>
            <a
              data-hero="cta"
              data-cursor="link"
              href="#moment"
              onClick={(e) => go(e, "#moment")}
              className="group inline-flex items-center gap-2 px-4 py-3.5 font-sans text-sm font-medium text-ivory/90"
            >
              Den Moment sehen
              <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      <p className="label absolute bottom-7 right-6 z-10 hidden origin-bottom-right -rotate-90 text-ivory/45 md:block">
        Hochzeiten · Events · Feiern — 2026
      </p>
    </section>
  );
}
