"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  prefersReducedMotion,
  scrollToTarget,
} from "@/lib/gsap";

const STEPS = [
  {
    n: "01",
    title: "Gespräch",
    text: "Datum, Gästezahl und Ihre Vision — wir hören zu und beraten offen.",
    image: "/images/gallery-table.jpg",
  },
  {
    n: "02",
    title: "Konzept",
    text: "Menü- und Display-Plan, abgestimmt auf Anlass, Ort und Stil.",
    image: "/images/wedding-desserts.jpg",
  },
  {
    n: "03",
    title: "Probe & Freigabe",
    text: "Verkostung oder Foto-Freigabe, bevor der große Tag kommt.",
    image: "/images/flavor-summer.jpg",
  },
  {
    n: "04",
    title: "Am Tag",
    text: "Aufbau, Service im Zeitfenster und sauberer Abbau — Sie feiern.",
    image: "/images/gallery-event.jpg",
  },
];

const MORPH_PATHS = [
  "M18 50 C18 32 32 22 50 22 C68 22 82 32 82 50 C82 68 68 78 50 78 C32 78 18 68 18 50 Z M28 50 C28 38 38 30 50 30 C62 30 72 38 72 50 C72 62 62 70 50 70 C38 70 28 62 28 50 Z",
  "M18 28 H82 V72 H18 Z M18 42 H82 M40 28 V72 M62 28 V72",
  "M28 20 H72 V80 H28 Z M28 40 H72 M28 60 H72 M40 20 V80 M56 20 V80",
  "M30 38 H70 V78 H30 Z M30 38 L50 24 L70 38 M50 24 V78",
];

const PIN_ID = "process-pin";
const MORPH_LABELS = ["Teller", "Plan", "Buffet", "Favor"];

/**
 * Pinned Ablauf — trigger === pin (the section itself).
 * Step visuals driven by GSAP/DOM on scrub; React state only for the step list UI.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const morphRef = useRef<SVGPathElement>(null);
  const pinSt = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const clickLock = useRef(false);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !root.current) return;

      const el = root.current;
      const layers = gsap.utils.toArray<HTMLElement>(
        el.querySelectorAll("[data-process-layer]"),
      );
      const line = lineRef.current;
      const morph = morphRef.current;

      gsap.set(layers, { autoAlpha: 0 });
      if (layers[0]) gsap.set(layers[0], { autoAlpha: 1 });
      if (line) gsap.set(line, { drawSVG: "0%" });

      const last = STEPS.length - 1;

      const showStep = (i: number, immediate = false) => {
        if (i === activeRef.current && !immediate) return;
        activeRef.current = i;

        layers.forEach((layer, idx) => {
          gsap.to(layer, {
            autoAlpha: idx === i ? 1 : 0,
            duration: immediate ? 0 : 0.35,
            ease: "lc.soft",
            overwrite: "auto",
          });
        });

        if (morph) {
          gsap.to(morph, {
            morphSVG: { shape: MORPH_PATHS[i], type: "rotational" },
            duration: immediate ? 0 : 0.45,
            ease: "lc.soft",
            overwrite: "auto",
          });
        }

        const num = el.querySelector("[data-step-n]");
        const title = el.querySelector("[data-step-title]");
        const text = el.querySelector("[data-step-text]");
        const morphLabel = el.querySelector("[data-morph-label]");
        if (num) num.textContent = STEPS[i].n;
        if (title) title.textContent = STEPS[i].title;
        if (text) text.textContent = STEPS[i].text;
        if (morphLabel) morphLabel.textContent = MORPH_LABELS[i];

        // List UI only — no layer styles in React
        setActive(i);
      };

      const st = ScrollTrigger.create({
        id: PIN_ID,
        trigger: el,
        pin: true,
        start: "top top",
        end: `+=${STEPS.length * 85}%`,
        scrub: 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (clickLock.current) return;
          const i = Math.min(last, Math.round(self.progress * last));
          showStep(i);
          if (line) gsap.set(line, { drawSVG: `${self.progress * 100}%` });
        },
      });

      pinSt.current = st;
      showStep(0, true);

      // Expose for click handler without stale closures
      (el as HTMLElement & { __showStep?: typeof showStep }).__showStep =
        showStep;

      return () => {
        st.kill();
        pinSt.current = null;
        gsap.set(layers, { clearProps: "opacity,visibility" });
      };
    },
    { scope: root },
  );

  const selectStep = (i: number) => {
    clickLock.current = true;
    const el = root.current as
      | (HTMLElement & { __showStep?: (i: number) => void })
      | null;
    el?.__showStep?.(i);

    const st = pinSt.current ?? ScrollTrigger.getById(PIN_ID);
    if (st && !prefersReducedMotion()) {
      const last = STEPS.length - 1;
      const progress = last === 0 ? 0 : i / last;
      const y = st.start + (st.end - st.start) * progress;
      gsap.to(window, {
        duration: 0.65,
        ease: "lc.soft",
        scrollTo: { y, autoKill: false },
        overwrite: "auto",
      });
    }

    window.setTimeout(() => {
      clickLock.current = false;
    }, 700);
  };

  return (
    <section
      id="ablauf"
      ref={root}
      className="flex min-h-[100svh] flex-col justify-center bg-paper px-6 py-20 text-ink md:px-12 md:py-24"
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="grid gap-8 md:grid-cols-[.55fr_1.45fr]">
          <div>
            <p className="label text-accent">05 / Ablauf</p>
            <p className="mt-5 font-sans text-sm text-ink/45">
              Ideal: 4–6 Wochen
              <br />
              vor Ihrem Termin.
            </p>
          </div>
          <h2 className="max-w-[13ch] font-display text-5xl font-medium leading-[.95] tracking-[-.04em] md:text-7xl">
            Von der Anfrage bis zum letzten Gang.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-12">
          <div
            data-process-media
            data-cursor="media"
            className="relative aspect-[4/5] overflow-hidden bg-night md:aspect-[16/11] lg:aspect-auto lg:min-h-[min(68svh,34rem)]"
          >
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                data-process-layer
                className="absolute inset-0"
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
            <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-night/75 via-transparent to-transparent" />

            <div className="absolute right-5 top-5 z-20 flex flex-col items-end gap-2">
              <svg
                viewBox="0 0 100 100"
                className="h-14 w-14 text-brass md:h-16 md:w-16"
                aria-hidden
              >
                <path
                  ref={morphRef}
                  d={MORPH_PATHS[0]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <span data-morph-label className="label text-ivory/50">
                {MORPH_LABELS[0]}
              </span>
            </div>

            <span
              data-step-n
              className="absolute left-5 top-5 z-20 font-display text-3xl font-medium leading-none text-paper/40 md:left-6 md:top-6 md:text-4xl"
            >
              {STEPS[0].n}
            </span>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8">
              <h3
                data-step-title
                className="font-display text-3xl font-medium text-ivory md:text-4xl"
              >
                {STEPS[0].title}
              </h3>
              <p
                data-step-text
                className="mt-3 max-w-[40ch] font-body text-base leading-relaxed text-ivory/75"
              >
                {STEPS[0].text}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="relative pl-2">
              <svg
                className="pointer-events-none absolute left-[1.35rem] top-3 h-[calc(100%-1.5rem)] w-8 md:left-[1.5rem]"
                viewBox="0 0 8 400"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M4 0 V400"
                  stroke="rgba(35,31,32,0.15)"
                  strokeWidth="1"
                  fill="none"
                />
                <path
                  ref={lineRef}
                  d="M4 0 V400"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>

              <ol className="relative flex flex-col gap-2">
                {STEPS.map((s, i) => {
                  const on = i === active;
                  return (
                    <li key={s.n}>
                      <button
                        type="button"
                        data-cursor="link"
                        onClick={() => selectStep(i)}
                        className={`group flex w-full items-start gap-5 px-2 py-4 text-left transition-colors ${
                          on ? "opacity-100" : "opacity-45 hover:opacity-80"
                        }`}
                      >
                        <span
                          className={`relative z-10 mt-0.5 flex h-10 w-10 flex-none items-center justify-center font-sans text-xs font-medium ring-1 transition-colors ${
                            on
                              ? "bg-accent text-paper ring-accent"
                              : "bg-paper text-ink ring-ink/25"
                          }`}
                        >
                          {s.n}
                        </span>
                        <span>
                          <span className="block font-display text-2xl font-medium leading-none">
                            {s.title}
                          </span>
                          <span
                            className={`mt-2 block max-w-[32ch] font-body text-sm leading-relaxed transition-all duration-300 ${
                              on
                                ? "max-h-24 opacity-70"
                                : "max-h-0 overflow-hidden opacity-0"
                            }`}
                          >
                            {s.text}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <a
              href="#anfrage"
              data-cursor="cta"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget("#anfrage");
              }}
              className="mt-10 inline-flex items-center gap-2 self-start border-b border-accent pb-1 font-sans text-sm font-medium text-ink"
            >
              Mit dem Gespräch starten
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
