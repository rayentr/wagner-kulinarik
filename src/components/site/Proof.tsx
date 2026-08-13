"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import {
  Draggable,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from "@/lib/gsap";
import { Reveal } from "./Reveal";

const SHOTS = [
  {
    image: "/images/gallery-event.jpg",
    alt: "Festlich gedeckter Eventtisch mit Kerzen und Gang-Service",
    place: "Event, Berlin",
  },
  {
    image: "/images/gallery-dessert.jpg",
    alt: "Feine Nachspeisen auf einer silbernen Etagere",
    place: "Hochzeit, Potsdam",
  },
  {
    image: "/images/celebration-cookies.jpg",
    alt: "Inszenierte Gang-Präsentation für eine private Feier",
    place: "Geburtstag, Berlin",
  },
  {
    image: "/images/gallery-table.jpg",
    alt: "Kleine Gastgeschenke am gedeckten Tisch",
    place: "Favor, Brandenburg",
  },
  {
    image: "/images/wedding-desserts.jpg",
    alt: "Hochzeitstisch mit Desserts und Blüten",
    place: "Hochzeit, Brandenburg",
  },
  {
    image: "/images/flavor-signature.jpg",
    alt: "House Signature Gang im Detail",
    place: "Signature, Atelier",
  },
];

/**
 * Horizontal proof reel — Draggable + click half-zones.
 * Lightbox without Flip (Flip absolute left muddy stuck transforms).
 */
export function Proof() {
  const root = useRef<HTMLElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const dragRef = useRef<Draggable[] | null>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;

      const syncBounds = () => {
        const drag = dragRef.current?.[0];
        if (!drag) return;
        const maxX = Math.min(0, window.innerWidth - el.scrollWidth - 48);
        drag.applyBounds({ minX: maxX, maxX: 0 });
      };

      dragRef.current = Draggable.create(el, {
        type: "x",
        inertia: true,
        edgeResistance: 0.82,
        dragResistance: 0.12,
        throwResistance: 2200,
        allowContextMenu: true,
        onPress() {
          (this as Draggable & { _moved?: boolean })._moved = false;
        },
        onDrag() {
          (this as Draggable & { _moved?: boolean })._moved = true;
        },
      });

      syncBounds();
      window.addEventListener("resize", syncBounds);
      return () => {
        window.removeEventListener("resize", syncBounds);
        dragRef.current?.forEach((d) => d.kill());
        dragRef.current = null;
        gsap.set(el, { clearProps: "transform" });
      };
    },
    { scope: root },
  );

  // Close lightbox on scroll so backdrop never sticks over later sections
  useEffect(() => {
    if (open === null) return;
    const close = () => setOpen(null);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const nudge = (dir: 1 | -1) => {
    const el = track.current;
    const drag = dragRef.current?.[0];
    if (!el || !drag) return;

    const step = Math.min(window.innerWidth * 0.55, 440);
    const next = gsap.utils.clamp(drag.minX, drag.maxX, drag.x + dir * step);

    if (prefersReducedMotion()) {
      gsap.set(el, { x: next });
      drag.update();
      return;
    }

    gsap.to(el, {
      x: next,
      duration: 0.65,
      ease: "lc.soft",
      overwrite: "auto",
      onUpdate: () => drag.update(),
    });
  };

  const onReelMove = (e: PointerEvent<HTMLDivElement>) => {
    const host = reel.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const left = e.clientX < rect.left + rect.width / 2;
    host.setAttribute("data-cursor", left ? "prev" : "next");
  };

  const onReelLeave = () => {
    reel.current?.setAttribute("data-cursor", "drag");
  };

  const onReelClick = (e: MouseEvent<HTMLDivElement>) => {
    const drag = dragRef.current?.[0] as
      | (Draggable & { _moved?: boolean })
      | undefined;
    if (drag?._moved) return;

    const thumb = (e.target as HTMLElement).closest(
      "[data-proof-thumb]",
    ) as HTMLElement | null;

    if (thumb) {
      const index = Number(thumb.dataset.index);
      if (!Number.isNaN(index)) setOpen(index);
      return;
    }

    const host = reel.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const left = e.clientX < rect.left + rect.width / 2;
    nudge(left ? 1 : -1);
  };

  return (
    <section
      id="nachweis"
      ref={root}
      className="bg-cream px-6 py-24 text-ink md:px-12 md:py-36"
    >
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <p className="label text-accent">06 / Gelebte Momente</p>
          <div className="mt-6 flex items-end justify-between gap-8">
            <h2 className="max-w-[10ch] font-display text-5xl font-medium leading-[.92] tracking-[-.04em] md:text-8xl">
              Echte Feiern, echte Tische.
            </h2>
            <span className="hidden font-display text-8xl italic text-brass/45 md:block">
              proof.
            </span>
          </div>
          <p className="mt-4 label text-ink/40">
            Ziehen · klicken links / rechts · tippen zum Öffnen
          </p>
        </Reveal>
      </div>

      <div
        ref={reel}
        data-cursor="drag"
        onPointerMove={onReelMove}
        onPointerLeave={onReelLeave}
        onClick={onReelClick}
        className="mt-14 cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <div
          ref={track}
          className="flex w-max gap-4 px-6 will-change-transform md:gap-5 md:px-12"
        >
          {SHOTS.map((s, i) => (
            <figure
              key={s.image}
              data-proof-thumb
              data-index={i}
              className="relative h-[52vw] w-[72vw] flex-none overflow-hidden bg-night sm:h-[42vw] sm:w-[48vw] md:h-[22rem] md:w-[28rem] lg:h-[26rem] lg:w-[34rem]"
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="(max-width: 768px) 72vw, 34rem"
                className="object-cover"
                draggable={false}
              />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-night/70 to-transparent p-5">
                <span className="label text-ivory/70">{s.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1500px]">
        <Reveal delay={0.1}>
          <blockquote className="mx-auto mt-20 max-w-3xl text-center">
            <p className="font-display text-3xl font-medium leading-snug text-ink text-balance md:text-5xl">
              „Der Tisch war der Moment, über den alle Gäste noch Wochen
              später gesprochen haben.“
            </p>
            <footer className="mt-6 label text-ink/45">
              — Hochzeit, Brandenburg
            </footer>
          </blockquote>
        </Reveal>
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal
          aria-label={SHOTS[open].alt}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-night/85 p-6"
          onClick={() => setOpen(null)}
          data-cursor="hide"
        >
          <button
            type="button"
            data-cursor="link"
            onClick={() => setOpen(null)}
            className="label absolute right-6 top-6 text-ivory/70"
          >
            Schließen
          </button>
          <div
            className="relative aspect-[4/5] w-full max-w-lg overflow-hidden md:aspect-[5/4] md:max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={SHOTS[open].image}
              alt={SHOTS[open].alt}
              fill
              sizes="(max-width: 768px) 90vw, 48rem"
              className="object-cover"
              priority
            />
            <p className="absolute bottom-5 left-5 label text-ivory">
              {SHOTS[open].place}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
