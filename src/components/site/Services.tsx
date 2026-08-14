"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { loadFlip } from "@/lib/gsap-plugins";

const DRAWERS = [
  {
    name: "Venue",
    line: "Der Rahmen. Halle, Garten, Dach — wo der Abend steht.",
    image: "/images/service-venue.jpg",
    crop: "40% 50%",
  },
  {
    name: "Küche",
    line: "Was auf den Teller kommt. Kein Buffet-Katalog — ein Gang.",
    image: "/images/service-kitchen.jpg",
    crop: "50% 40%",
  },
  {
    name: "Live Cooking",
    line: "Der Koch am Tisch. Sichtbar, schmeckbar.",
    image: "/images/service-live.jpg",
    crop: "50% 35%",
  },
  {
    name: "Gläser",
    line: "Was in der Hand bleibt, wenn geredet wird.",
    image: "/images/service-drinks.jpg",
    crop: "50% 60%",
  },
  {
    name: "Musik",
    line: "Bis die Nacht laut wird. Oder leise bleibt.",
    image: "/images/service-music.jpg",
    crop: "55% 40%",
  },
] as const;

const INDEX =
  "Ort · Küche · Live · Stände · Gläser · Hochzeit · Feier · Musik · Foto · Deko · Licht · Hände · Kinder · Leih · Fahrt";

type FlipApi = Awaited<ReturnType<typeof loadFlip>>;

/**
 * Sideboard — Flip moves the tray. A name opens a drawer.
 */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const flipRef = useRef<FlipApi | null>(null);
  const stateRef = useRef<ReturnType<FlipApi["getState"]> | null>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    let dead = false;
    void loadFlip().then((Flip) => {
      if (!dead) flipRef.current = Flip;
    });
    return () => {
      dead = true;
    };
  }, []);

  useLayoutEffect(() => {
    const Flip = flipRef.current;
    const state = stateRef.current;
    if (!state) return;

    const photo = root.current?.querySelector(
      `[data-tray="${active}"] [data-tray-photo]`,
    );

    if (!Flip) {
      if (photo && !prefersReducedMotion()) {
        gsap.fromTo(
          photo,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.78, ease: "lc.soft" },
        );
      }
      return;
    }

    const reduce = prefersReducedMotion();
    Flip.from(state, {
      duration: reduce ? 0 : 0.72,
      ease: "lc.soft",
      nested: true,
      prune: true,
      onEnter: (elements) => {
        if (reduce) return;
        gsap.fromTo(
          elements,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "lc.soft" },
        );
      },
    });
    stateRef.current = null;
  }, [active]);

  const open = (i: number) => {
    if (i === active) return;
    const Flip = flipRef.current;
    const el = root.current;
    if (Flip && el && !prefersReducedMotion()) {
      stateRef.current = Flip.getState(el.querySelectorAll("[data-flip]"));
    }
    setActive(i);
  };

  return (
    <section
      id="leistungen"
      ref={root}
      className="bg-paper px-6 py-14 text-ink md:px-12 md:py-16"
    >
      <div className="mx-auto max-w-[1500px]">
        <p className="label text-ink/45">Der Schrank</p>
        <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(2.4rem,5vw,4.2rem)] font-medium leading-[.92] tracking-[-.04em]">
          Was auf den Tisch darf.
        </h2>

        <div className="mt-12 border-t border-ink/15">
          {DRAWERS.map((d, i) => {
            const on = i === active;
            return (
              <div key={d.name} data-flip className="border-b border-ink/15">
                <button
                  type="button"
                  data-cursor="link"
                  aria-expanded={on}
                  aria-controls={`tray-${d.name}`}
                  onClick={() => open(i)}
                  className="flex w-full items-baseline justify-between gap-6 py-5 text-left"
                >
                  <span
                    data-flip
                    className={`font-display font-medium tracking-[-.03em] ${
                      on
                        ? "text-[clamp(2rem,4vw,3.4rem)] italic leading-none"
                        : "text-2xl text-ink/45 md:text-3xl"
                    }`}
                  >
                    {d.name}
                  </span>
                  <span className="label shrink-0 text-ink/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>

                <div
                  id={`tray-${d.name}`}
                  data-flip
                  data-tray={i}
                  className={`grid overflow-hidden ${
                    on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="grid gap-8 pb-10 md:grid-cols-[.7fr_1fr] md:items-end">
                      <div className="relative aspect-[4/5] overflow-hidden bg-night-soft md:max-w-sm">
                        <div data-tray-photo className="absolute inset-0">
                          <Image
                            src={d.image}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 28rem"
                            className="object-cover"
                            style={{
                              objectPosition: d.crop,
                              transform: "scale(1.35)",
                            }}
                          />
                        </div>
                      </div>
                      <p className="max-w-[32ch] font-sans text-base leading-relaxed text-ink/60 md:pb-2">
                        {d.line}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-12 max-w-[62ch] font-sans text-sm leading-relaxed text-ink/40">
          {INDEX}
        </p>
      </div>
    </section>
  );
}
