"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { loadDraggable } from "@/lib/gsap-plugins";
import { Pass } from "./Pass";

const PRINTS = [
  {
    image: "/images/print-01.jpg",
    alt: "Kerzen, ein langer Tisch",
    note: "Zu spät gekommen.",
    rotate: "-3.2deg",
    width: "w-[36vw] sm:w-[28vw] lg:w-[20rem]",
  },
  {
    image: "/images/print-02.jpg",
    alt: "Der erste Schnitt",
    note: "Der erste Schnitt.",
    rotate: "2.4deg",
    width: "w-[32vw] sm:w-[26vw] lg:w-[18rem]",
  },
  {
    image: "/images/print-03.jpg",
    alt: "Etwas Süßes am Tisch",
    note: "Jemand lacht zu laut.",
    rotate: "-1.6deg",
    width: "w-[38vw] sm:w-[30vw] lg:w-[22rem]",
  },
  {
    image: "/images/print-04.jpg",
    alt: "Gedeckter Tisch",
    note: "Der Tisch.",
    rotate: "3.1deg",
    width: "w-[34vw] sm:w-[27vw] lg:w-[19rem]",
  },
  {
    image: "/images/print-05.jpg",
    alt: "Nachspeise",
    note: "Danach.",
    rotate: "-2.2deg",
    width: "w-[30vw] sm:w-[24vw] lg:w-[17rem]",
  },
  {
    image: "/images/print-06.jpg",
    alt: "Ein Gang im Detail",
    note: "Noch ein Glas.",
    rotate: "1.8deg",
    width: "w-[35vw] sm:w-[28vw] lg:w-[20rem]",
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

function dist(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function bindPinch(figure: HTMLElement) {
  const photo = figure.querySelector("img");
  if (!photo) return () => {};

  let start = 0;
  let base = 1.2;

  const onStart = (e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    start = dist(e.touches[0], e.touches[1]);
    base = Number(gsap.getProperty(photo, "scale")) || 1.2;
  };

  const onMove = (e: TouchEvent) => {
    if (e.touches.length !== 2 || start <= 0) return;
    e.preventDefault();
    e.stopPropagation();
    const next = gsap.utils.clamp(1, 2.35, base * (dist(e.touches[0], e.touches[1]) / start));
    gsap.set(photo, { scale: next });
  };

  const onEnd = (e: TouchEvent) => {
    if (e.touches.length >= 2) return;
    start = 0;
    gsap.to(photo, { scale: 1.2, duration: 0.55, ease: "lc.soft", overwrite: "auto" });
  };

  figure.addEventListener("touchstart", onStart, { passive: true });
  figure.addEventListener("touchmove", onMove, { passive: false });
  figure.addEventListener("touchend", onEnd);
  figure.addEventListener("touchcancel", onEnd);

  return () => {
    figure.removeEventListener("touchstart", onStart);
    figure.removeEventListener("touchmove", onMove);
    figure.removeEventListener("touchend", onEnd);
    figure.removeEventListener("touchcancel", onEnd);
    gsap.set(photo, { clearProps: "transform" });
  };
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

      const prints = gsap.utils.toArray<HTMLElement>("[data-print]", root.current);
      const pinches: Array<() => void> = [];

      prints.forEach((figure) => {
        pinches.push(bindPinch(figure));
      });

      void loadDraggable().then((Draggable) => {
        if (dead || !track.current) return;
        const row = Draggable.create(el, {
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
        const cards = Draggable.create(prints, {
          type: "x,y",
          inertia: true,
          bounds: root.current ?? undefined,
          edgeResistance: 0.72,
          dragResistance: 0.12,
          throwResistance: 2200,
          zIndexBoost: true,
          allowContextMenu: true,
          onPress() {
            const ev = (this as { pointerEvent?: TouchEvent }).pointerEvent;
            const node = (this as { target?: HTMLElement }).target;
            if (node) node.dataset.moved = "0";
            if (ev?.touches && ev.touches.length > 1) {
              (this as { endDrag?: () => void }).endDrag?.();
            }
          },
          onDrag() {
            const node = (this as { target?: HTMLElement }).target;
            if (node) node.dataset.moved = "1";
          },
        });
        dragRef.current = [...row, ...cards];
        syncBounds();
      });

      window.addEventListener("resize", syncBounds);
      return () => {
        dead = true;
        window.removeEventListener("resize", syncBounds);
        pinches.forEach((off) => off());
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
        <div className="relative h-full">
          <Image
            src="/images/night-room.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "40% 50%" }}
          />
          <div className="absolute inset-0 bg-night/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-night/10 to-transparent" />
          <div className="absolute inset-x-0 top-[max(4.75rem,calc(env(safe-area-inset-top)+3.25rem))] z-[1] px-6 md:px-12">
            <p className="label text-ivory/55">Ihr Tisch</p>
            <h2 className="mt-4 max-w-[12ch] font-display text-4xl font-medium leading-[.92] tracking-[-.045em] md:mt-5 md:text-8xl">
              Ihr seid geladen.
            </h2>
          </div>
          <div
            data-cursor="drag"
            className="absolute inset-x-0 bottom-0 z-[2] cursor-grab overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden md:pb-6"
          >
            <div
              ref={track}
              className="flex w-max items-end gap-4 px-6 will-change-transform md:gap-8 md:px-16"
            >
              {PRINTS.map((p) => (
                <figure
                  key={p.note}
                  data-cursor="media"
                  data-print
                  onClick={(e) => {
                    const drag = dragRef.current?.[0] as
                      | { _moved?: boolean }
                      | undefined;
                    if (drag?._moved) return;
                    if (e.currentTarget.dataset.moved === "1") return;
                    const lid = e.currentTarget.querySelector<HTMLElement>(
                      "[data-print-flash]",
                    );
                    flash(lid);
                  }}
                  className={`relative flex-none touch-none bg-cream p-1.5 pb-7 text-ink shadow-[0_18px_40px_rgba(0,0,0,.35)] md:p-2 md:pb-9 ${p.width}`}
                  style={{ transform: `rotate(${p.rotate})` }}
                >
                  <span className="relative block aspect-[4/5] overflow-hidden bg-night-soft">
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 1024px) 38vw, 20rem"
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
                  <figcaption className="mt-2 px-1 font-display text-xs italic leading-snug md:mt-3 md:text-sm">
                    {p.note}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </Pass>

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
