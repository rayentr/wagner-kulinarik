"use client";

import { useRef } from "react";
import Image from "next/image";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  prefersReducedMotion,
  scrollToTarget,
} from "@/lib/gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin);
}

const BEATS = [
  {
    n: "01",
    label: "Planen",
    line: "Der Anlass nimmt Form an.",
    image: "/images/gallery-table.jpg",
  },
  {
    n: "02",
    label: "Einladen",
    line: "Gäste per QR dabei.",
    image: "/images/gallery-dessert.jpg",
  },
  {
    n: "03",
    label: "Hosten",
    line: "Die Nacht beginnt.",
    image: "/images/gallery-event.jpg",
  },
  {
    n: "04",
    label: "Teilen",
    line: "Momente bleiben.",
    image: "/images/celebration-cookies.jpg",
  },
];

/**
 * Pinned beat film — trigger === pin target (stage only).
 * Bridge lives in a sibling section so it never fights the pin spacer.
 */
export function MomentFilm() {
  const stage = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = stage.current;
      if (!el) return;

      const panels = gsap.utils.toArray<HTMLElement>(
        el.querySelectorAll("[data-beat]"),
      );
      const photos = gsap.utils.toArray<HTMLElement>(
        el.querySelectorAll("[data-film-photo]"),
      );
      const drawSegs = gsap.utils.toArray<SVGGeometryElement>(
        el.querySelectorAll("[data-draw-seg]"),
      );
      if (!panels.length) return;

      gsap.set(panels, { autoAlpha: 0 });
      gsap.set(panels[0], { autoAlpha: 1 });
      gsap.set(drawSegs, { drawSVG: "0%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          pin: true,
          start: "top top",
          end: "+=220%",
          scrub: 0.35,
          id: "moment-film",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeave: () => {
            gsap.set(panels, { autoAlpha: 0 });
            gsap.set(panels[panels.length - 1], { autoAlpha: 1 });
          },
        },
      });

      if (photos[0]) {
        gsap.set(photos[0], { scale: 1.03 });
        tl.to(photos[0], { scale: 1, ease: "none", duration: 0.45 }, 0);
      }
      if (drawSegs[0]) {
        tl.to(drawSegs[0], { drawSVG: "100%", ease: "none", duration: 0.3 }, 0);
      }

      panels.forEach((panel, i) => {
        if (i === 0) return;
        const prev = panels[i - 1];
        const start = i - 0.1;

        tl.to(prev, { autoAlpha: 0, ease: "none", duration: 0.45 }, start)
          .fromTo(
            panel,
            { autoAlpha: 0 },
            { autoAlpha: 1, ease: "none", duration: 0.45 },
            start,
          )
          .fromTo(
            photos[i],
            { scale: 1.04 },
            { scale: 1, ease: "none", duration: 0.55 },
            start,
          );

        if (drawSegs[i]) {
          tl.to(
            drawSegs[i],
            { drawSVG: "100%", ease: "none", duration: 0.45 },
            start,
          );
        }
      });

      return () => {
        ScrollTrigger.getById("moment-film")?.kill();
        gsap.set(panels, { clearProps: "opacity,visibility" });
      };
    },
    { scope: stage },
  );

  return (
    <>
      <section
        id="moment"
        ref={stage}
        data-stage
        className="relative h-dvh overflow-hidden bg-night"
      >
        {BEATS.map((b, i) => (
          <div
            key={b.n}
            data-beat
            data-cursor="media"
            className="absolute inset-0"
            style={{ zIndex: i }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                data-film-photo
                className="absolute inset-0 will-change-transform"
              >
                <Image
                  src={b.image}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            <div className="absolute inset-0 bg-night/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-night/30" />

            <span className="absolute left-6 top-6 z-10 font-display text-4xl font-medium leading-none text-paper/35 md:left-10 md:top-10 md:text-6xl">
              {b.n}
            </span>

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="label mb-4 text-brass">{b.label}</p>
              <h3 className="font-display text-4xl font-medium tracking-tight text-ivory drop-shadow-[0_12px_30px_rgba(0,0,0,.4)] md:text-6xl">
                {b.line}
              </h3>
            </div>
          </div>
        ))}

        <div className="absolute bottom-10 left-1/2 z-20 w-[min(90vw,22rem)] -translate-x-1/2">
          <svg
            viewBox="0 0 360 12"
            className="h-3 w-full overflow-visible"
            aria-hidden
          >
            <line
              x1="8"
              y1="6"
              x2="352"
              y2="6"
              stroke="rgba(252,250,248,0.12)"
              strokeWidth="1"
            />
            {BEATS.map((_, i) => {
              const x1 = 8 + i * 86;
              const x2 = x1 + 72;
              return (
                <line
                  key={i}
                  data-draw-seg
                  x1={x1}
                  y1="6"
                  x2={x2}
                  y2="6"
                  stroke="var(--brass)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </div>

        <p className="label absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 rotate-90 text-ivory/40 md:block">
          Event · 01—04
        </p>
      </section>

      <section className="relative min-h-[85dvh] overflow-hidden bg-night">
        <div className="absolute inset-0" data-cursor="media">
          <Image
            src="/images/wedding-desserts.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-night/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-night/80 via-night/35 to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[85dvh] flex-col justify-end px-6 py-16 md:px-12 md:py-24 lg:px-20">
          <p className="label text-brass">Weiter</p>
          <h3 className="mt-4 max-w-[12ch] font-display text-5xl font-medium leading-[.92] tracking-[-.04em] text-ivory md:text-7xl">
            Welcher Anlass ist Ihrer?
          </h3>
          <p className="mt-5 max-w-[38ch] font-body text-lg text-ivory/70">
            Anlässe entdecken — oder direkt Event planen und Reservierung
            anfragen.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#anlaesse"
              data-cursor="cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget("#anlaesse");
              }}
              className="bg-accent px-7 py-3.5 font-sans text-sm font-medium text-paper transition-colors hover:bg-berry-bright"
            >
              Anlässe entdecken
            </a>
            <a
              href="#anfrage"
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget("#anfrage");
              }}
              className="group inline-flex items-center gap-2 border-b border-ivory/40 pb-1 font-sans text-sm font-medium text-ivory"
            >
              Reservierung
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>

          <p className="mt-12 label text-ivory/45">
            Berlin &amp; Umland · App · DE / EN
          </p>
        </div>
      </section>
    </>
  );
}
