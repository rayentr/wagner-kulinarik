"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import { Observer } from "gsap/Observer";
import {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
  scrollToTarget,
  useGSAP,
} from "@/lib/gsap";
import { getLenis } from "@/lib/lenis-ref";
import { Magnetic } from "./Magnetic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

const STEPS = [
  {
    n: "01",
    title: "Anlass",
    text: "Welche Nacht ist das.",
    image: "/images/wedding-desserts.jpg",
    crop: "50% 30%",
  },
  {
    n: "02",
    title: "Paket",
    text: "Was auf den Tisch kommt.",
    image: "/images/gallery-table.jpg",
    crop: "50% 58%",
  },
  {
    n: "03",
    title: "Details",
    text: "Wann, wo, für wen — der Rahmen.",
    image: "/images/flavor-summer.jpg",
    crop: "50% 35%",
  },
  {
    n: "04",
    title: "Einladen",
    text: "Ein Link. Die Gäste finden den Tisch.",
    image: "/images/gallery-event.jpg",
    crop: "40% 50%",
  },
  {
    n: "05",
    title: "Momente",
    text: "Wenn die Lichter aus sind, bleibt sie.",
    image: "/images/celebration-cookies.jpg",
    crop: "50% 45%",
  },
] as const;

const OPEN = "inset(0% 0% 0% 0%)";
const CLOSED_DOWN = "inset(100% 0% 0% 0%)";
const CLOSED_UP = "inset(0% 0% 100% 0%)";

function ask(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  scrollToTarget("#anfrage");
}

/**
 * The pass — five stations. Desktop/touch: the page holds until the course is served.
 * Wipes, never a crossfade. Reduced motion: a stacked menu, not a settings list.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const pinEl = pin.current;
      const rootEl = root.current;
      if (!pinEl || !rootEl) return;

      const stations = gsap.utils.toArray<HTMLElement>(
        "[data-station]",
        pinEl,
      );
      const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]", pinEl);
      const n = stations.length;
      if (!n) return;

      const mark = (index: number) => {
        ticks.forEach((t, i) => t.setAttribute("data-on", i === index ? "1" : "0"));
        pinEl.setAttribute("aria-label", `${STEPS[index].title}, ${index + 1} von ${n}`);
      };

      const show = (index: number) => {
        stations.forEach((el, i) => {
          gsap.set(el, {
            zIndex: i === index ? 1 : 0,
            clipPath: i === index ? OPEN : CLOSED_DOWN,
          });
          gsap.set(el.querySelector("[data-station-copy]"), { yPercent: 0 });
          gsap.set(el.querySelector("[data-station-media]"), { yPercent: 0 });
        });
        mark(index);
      };

      if (prefersReducedMotion()) {
        stations.forEach((el) => {
          gsap.set(el, { clearProps: "clipPath,zIndex" });
        });
        return;
      }

      let current = 0;
      let animating = false;
      show(0);

      const go = (index: number, direction: number) => {
        if (animating || index === current || index < 0 || index >= n) return;
        animating = true;
        const incoming = stations[index];
        const outgoing = stations[current];
        const from = direction > 0 ? CLOSED_DOWN : CLOSED_UP;

        gsap.set(incoming, { zIndex: 2, clipPath: from });
        gsap.set(outgoing, { zIndex: 1 });

        const copy = incoming.querySelector("[data-station-copy]");
        const media = incoming.querySelector("[data-station-media]");

        const tl = gsap.timeline({
          defaults: { ease: "lc.soft" },
          onComplete: () => {
            gsap.set(outgoing, { zIndex: 0, clipPath: CLOSED_DOWN });
            gsap.set(incoming, { zIndex: 1, clipPath: OPEN });
            current = index;
            animating = false;
            mark(index);
          },
        });

        tl.to(incoming, { clipPath: OPEN, duration: 0.82 }, 0);
        if (media) {
          tl.fromTo(
            media,
            { yPercent: direction > 0 ? 10 : -10 },
            { yPercent: 0, duration: 0.82, ease: "none" },
            0,
          );
        }
        if (copy) {
          tl.fromTo(
            copy,
            { yPercent: 26 },
            { yPercent: 0, duration: 0.62 },
            0.18,
          );
        }
      };

      const observer = Observer.create({
        target: window,
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 40,
        preventDefault: true,
        onUp: () => {
          if (animating) return;
          if (current >= n - 1) {
            release(1);
            return;
          }
          go(current + 1, 1);
        },
        onDown: () => {
          if (animating) return;
          if (current <= 0) {
            release(-1);
            return;
          }
          go(current - 1, -1);
        },
      });
      observer.disable();

      let gated = false;

      const hold = () => {
        getLenis()?.stop();
        observer.enable();
      };

      const jump = (y: number) => {
        gated = true;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
        requestAnimationFrame(() => {
          gated = false;
        });
      };

      const release = (direction: number) => {
        observer.disable();
        const lenis = getLenis();
        lenis?.start();
        const pass = ScrollTrigger.getById("process-pass");
        if (!pass) return;
        jump(direction > 0 ? pass.end + 2 : Math.max(0, pass.start - 2));
      };

      const st = ScrollTrigger.create({
        trigger: pinEl,
        pin: true,
        start: "top top",
        end: "+=140%",
        anticipatePin: 1,
        id: "process-pass",
        onEnter: () => {
          if (gated || observer.isEnabled) return;
          show(0);
          current = 0;
          hold();
        },
        onEnterBack: () => {
          if (gated || observer.isEnabled) return;
          show(n - 1);
          current = n - 1;
          hold();
        },
        onLeave: () => {
          if (gated || !observer.isEnabled) return;
          observer.disable();
          getLenis()?.start();
        },
        onLeaveBack: () => {
          if (gated || !observer.isEnabled) return;
          observer.disable();
          getLenis()?.start();
        },
      });

      const onKey = (e: KeyboardEvent) => {
        if (!observer.isEnabled || animating) return;
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (e.key === "Escape") {
          e.preventDefault();
          release(1);
          return;
        }
        if (e.key === "ArrowDown" || e.key === "PageDown") {
          e.preventDefault();
          if (current >= n - 1) release(1);
          else go(current + 1, 1);
        }
        if (e.key === "ArrowUp" || e.key === "PageUp") {
          e.preventDefault();
          if (current <= 0) release(-1);
          else go(current - 1, -1);
        }
      };
      window.addEventListener("keydown", onKey);

      return () => {
        window.removeEventListener("keydown", onKey);
        observer.kill();
        st.kill();
        getLenis()?.start();
      };
    },
    { scope: root },
  );

  return (
    <section id="ablauf" ref={root} className="bg-paper text-ink">
      <h2 className="sr-only">Der Weg — fünf Stationen bis zur Nacht</h2>
      <div
        ref={pin}
        data-cursor="media"
        className="relative motion-safe:h-[100svh] motion-safe:overflow-hidden"
        role="region"
        aria-roledescription="Karussell"
      >
        {STEPS.map((s, i) => (
          <article
            key={s.n}
            data-station
            className={`relative motion-reduce:border-b motion-reduce:border-ink/10 motion-safe:absolute motion-safe:inset-0 ${
              i === 0 ? "motion-safe:z-[1]" : "motion-safe:z-0 motion-safe:[clip-path:inset(100%_0_0_0)]"
            }`}
          >
            <div
              data-station-media
              className="relative aspect-[4/5] overflow-hidden bg-night-soft motion-reduce:max-h-[52svh] motion-safe:absolute motion-safe:inset-0 motion-safe:aspect-auto motion-safe:max-h-none"
            >
              <Image
                src={s.image}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                style={{
                  objectPosition: s.crop,
                  transform: "scale(1.4)",
                }}
                priority={i === 0}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-64 bg-gradient-to-t from-night/80 to-transparent motion-safe:block" />

            <div className="relative z-10 px-6 py-8 md:px-12 motion-safe:absolute motion-safe:inset-x-0 motion-safe:bottom-0 motion-safe:px-6 motion-safe:pb-16 motion-safe:pt-0 md:motion-safe:px-16">
              <p className="label mb-6 text-ink/40 motion-safe:text-ivory/45">
                Der Weg
              </p>
              <div className="overflow-hidden">
                <div data-station-copy>
                  <p className="font-display text-2xl font-medium text-ink/35 motion-safe:text-ivory/40 md:text-3xl">
                    {s.n}
                  </p>
                  <h3 className="mt-3 max-w-[10ch] font-display text-[clamp(2.6rem,6vw,5.2rem)] font-medium leading-[.9] tracking-[-.04em] motion-safe:text-ivory">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-[28ch] font-sans text-sm leading-relaxed text-ink/60 motion-safe:text-ivory/75">
                    {s.text}
                  </p>
                  {i === STEPS.length - 1 && (
                    <Magnetic strength={18}>
                      <a
                        href="#anfrage"
                        data-cursor="cta"
                        onClick={ask}
                        className="pointer-events-auto mt-7 inline-block font-sans text-sm text-accent"
                      >
                        Den Abend anfragen →
                      </a>
                    </Magnetic>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

        <ol
          className="pointer-events-none absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 motion-safe:flex md:right-10"
          aria-hidden
        >
          {STEPS.map((s, i) => (
            <li key={s.n}>
              <span
                data-tick
                data-on={i === 0 ? "1" : "0"}
                className="block h-7 w-px bg-ivory/25 data-[on=1]:bg-ivory"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
