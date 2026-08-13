"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { loadDraggable } from "@/lib/gsap-plugins";
import { Pass } from "./Pass";

const PRINTS = [
  {
    image: "/images/gallery-event.jpg",
    alt: "Kerzen, ein langer Tisch",
    note: "Zu spät gekommen.",
    rotate: "-3.2deg",
    width: "w-[58vw] sm:w-[42vw] lg:w-[22rem]",
  },
  {
    image: "/images/wedding-desserts.jpg",
    alt: "Der erste Schnitt",
    note: "Der erste Schnitt.",
    rotate: "2.4deg",
    width: "w-[52vw] sm:w-[38vw] lg:w-[20rem]",
  },
  {
    image: "/images/celebration-cookies.jpg",
    alt: "Etwas Süßes am Tisch",
    note: "Jemand lacht zu laut.",
    rotate: "-1.6deg",
    width: "w-[62vw] sm:w-[44vw] lg:w-[24rem]",
  },
  {
    image: "/images/gallery-table.jpg",
    alt: "Gedeckter Tisch",
    note: "Der Tisch.",
    rotate: "3.1deg",
    width: "w-[54vw] sm:w-[40vw] lg:w-[21rem]",
  },
  {
    image: "/images/gallery-dessert.jpg",
    alt: "Nachspeise",
    note: "Danach.",
    rotate: "-2.2deg",
    width: "w-[50vw] sm:w-[36vw] lg:w-[19rem]",
  },
  {
    image: "/images/flavor-signature.jpg",
    alt: "Ein Gang im Detail",
    note: "Noch ein Glas.",
    rotate: "1.8deg",
    width: "w-[56vw] sm:w-[40vw] lg:w-[22rem]",
  },
] as const;

function playShutter() {
  if (typeof window === "undefined") return;
  if (prefersReducedMotion()) return;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const length = Math.floor(ctx.sampleRate * 0.045);
  const buf = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.18));
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 900;
  const gain = ctx.createGain();
  gain.gain.value = 0.22;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  src.onended = () => void ctx.close();
}

function flash(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) {
    playShutter();
    return;
  }
  gsap.fromTo(
    el,
    { clipPath: "inset(50% 0% 50% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.05,
      ease: "none",
      onStart: playShutter,
      onComplete: () => {
        gsap.to(el, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.4,
          ease: "lc.soft",
        });
      },
    },
  );
}

/**
 * The night — a room you enter. Polaroids with weight; booth and place card as objects.
 */
export function NightOf() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const roomFlash = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dragRef = useRef<any[] | null>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;

      let dead = false;

      const syncBounds = () => {
        const drag = dragRef.current?.[0];
        if (!drag) return;
        const maxX = Math.min(0, window.innerWidth - el.scrollWidth - 64);
        drag.applyBounds({ minX: maxX, maxX: 0 });
      };

      void loadDraggable().then((Draggable) => {
        if (dead || !track.current) return;
        dragRef.current = Draggable.create(el, {
          type: "x",
          inertia: true,
          edgeResistance: 0.86,
          dragResistance: 0.08,
          throwResistance: 1800,
          allowContextMenu: true,
          onPress() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any)._moved = false;
          },
          onDrag() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this as any)._moved = true;
          },
        });
        syncBounds();
      });

      window.addEventListener("resize", syncBounds);
      return () => {
        dead = true;
        window.removeEventListener("resize", syncBounds);
        dragRef.current?.forEach((d) => d.kill());
        dragRef.current = null;
        gsap.set(el, { clearProps: "transform" });
      };
    },
    { scope: root },
  );

  return (
    <section
      id="nacht"
      ref={root}
      className="relative bg-night text-ivory"
    >
      <Pass mark="Die Nacht">
        <div className="flex h-full flex-col justify-end px-6 pb-24 md:px-12 md:pb-28">
          <p className="label text-ivory/45">Ihr Tisch</p>
          <h2 className="mt-5 max-w-[12ch] font-display text-5xl font-medium leading-[.92] tracking-[-.045em] md:text-8xl">
            Ihr seid geladen.
          </h2>
        </div>
      </Pass>

      <div
        data-cursor="drag"
        className="cursor-grab overflow-x-auto overflow-y-hidden pb-6 pt-4 [scrollbar-width:none] active:cursor-grabbing motion-safe:overflow-hidden [&::-webkit-scrollbar]:hidden md:pb-8"
      >
        <div
          ref={track}
          className="flex w-max items-end gap-5 px-8 will-change-transform md:gap-8 md:px-16"
        >
          {PRINTS.map((p) => (
            <figure
              key={p.note}
              data-cursor="media"
              onClick={(e) => {
                const drag = dragRef.current?.[0] as
                  | { _moved?: boolean }
                  | undefined;
                if (drag?._moved) return;
                const lid = e.currentTarget.querySelector<HTMLElement>(
                  "[data-print-flash]",
                );
                flash(lid);
              }}
              className={`relative flex-none bg-cream p-2 pb-9 text-ink shadow-[0_18px_40px_rgba(0,0,0,.35)] ${p.width}`}
              style={{ transform: `rotate(${p.rotate})` }}
            >
              <span className="relative block aspect-[4/5] overflow-hidden bg-night-soft">
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 1024px) 58vw, 22rem"
                  className="object-cover"
                  draggable={false}
                  style={{ transform: "scale(1.2)" }}
                />
                <span
                  data-print-flash
                  className="pointer-events-none absolute inset-0 bg-ivory"
                  style={{ clipPath: "inset(0% 0% 100% 0%)" }}
                  aria-hidden
                />
              </span>
              <figcaption className="mt-3 px-1 font-display text-sm italic leading-snug">
                {p.note}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-6 px-6 pb-20 pt-4 md:gap-10 md:px-16 md:pb-28">
        <button
          type="button"
          data-cursor="cta"
          onClick={() => flash(roomFlash.current)}
          className="w-[min(100%,16rem)] rotate-[-1.5deg] bg-cream px-6 py-5 text-left text-ink"
        >
          <span className="label text-ink/40">Booth</span>
          <span className="mt-3 block font-display text-3xl italic leading-none">
            Auslösen
          </span>
          <span className="mt-3 block font-sans text-xs text-ink/50">
            Nur wenn Sie wollen.
          </span>
        </button>

        <div className="w-[min(100%,18rem)] rotate-[2deg] bg-cream px-6 py-6 text-ink">
          <p className="label text-ink/40">Platzkarte</p>
          <p className="mt-3 font-display text-3xl font-medium leading-none">
            Berlin
          </p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ink/55">
            Zeit und Ort — in der Einladung.
          </p>
        </div>

        <div className="w-[min(100%,16rem)] rotate-[-2.5deg] border border-ivory/20 px-5 py-5">
          <p className="label text-ivory/40">Der Weg</p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ivory/65">
            Wenn der Tisch steht, finden Sie hin.
          </p>
        </div>
      </div>

      <div
        ref={roomFlash}
        className="pointer-events-none absolute inset-0 z-30 bg-ivory"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
        aria-hidden
      />
    </section>
  );
}
