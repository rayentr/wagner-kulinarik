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
  gsap,
  prefersReducedMotion,
  useGSAP,
} from "@/lib/gsap";
import { loadDraggable } from "@/lib/gsap-plugins";

const SHOTS = [
  {
    image: "/images/proof-01.jpg",
    alt: "Festlich gedeckter Eventtisch mit Kerzen und Gang-Service",
    place: "Berlin, spät.",
  },
  {
    image: "/images/proof-02.jpg",
    alt: "Fein angerichtete Speisen auf einer Etagere",
    place: "Potsdam.",
  },
  {
    image: "/images/proof-03.jpg",
    alt: "Gang-Präsentation für eine private Feier",
    place: "Zu laut.",
  },
  {
    image: "/images/proof-04.jpg",
    alt: "Gedeckter Tisch mit Details",
    place: "Der Tisch.",
  },
  {
    image: "/images/proof-05.jpg",
    alt: "Hochzeitstisch mit Blüten und Speisen",
    place: "Der Schnitt.",
  },
  {
    image: "/images/proof-06.jpg",
    alt: "Signature-Gang im Detail",
    place: "Noch ein Glas.",
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
        const maxX = Math.min(0, window.innerWidth - el.scrollWidth - 48);
        drag.applyBounds({ minX: maxX, maxX: 0 });
      };

      void loadDraggable().then((Draggable) => {
        if (dead || !track.current) return;
        dragRef.current = Draggable.create(el, {
          type: "x",
          inertia: true,
          edgeResistance: 0.82,
          dragResistance: 0.12,
          throwResistance: 2200,
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
    const drag = dragRef.current?.[0] as { _moved?: boolean } | undefined;
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
      id="galerie"
      ref={root}
      className="bg-paper pb-8 pt-6 text-ink"
    >
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <p className="label text-ink/45">Film</p>
        <h2 className="mt-3 max-w-[12ch] font-display text-[clamp(2.2rem,4.5vw,4rem)] font-medium leading-[.92] tracking-[-.04em]">
          Nächte, die man teilt.
        </h2>
      </div>

      <div
        ref={reel}
        data-cursor="drag"
        onPointerMove={onReelMove}
        onPointerLeave={onReelLeave}
        onClick={onReelClick}
        className="mt-10 cursor-grab overflow-hidden bg-night py-6 active:cursor-grabbing"
      >
        <div
          ref={track}
          className="flex w-max items-center gap-3 px-6 will-change-transform md:gap-4 md:px-12"
        >
          {SHOTS.map((s, i) => (
            <figure
              key={s.image}
              data-proof-thumb
              data-index={i}
              className="relative h-[42vw] w-[58vw] flex-none overflow-hidden bg-night-soft sm:h-[32vw] sm:w-[42vw] md:h-[18rem] md:w-[24rem] lg:h-[20rem] lg:w-[28rem]"
              style={{
                boxShadow: "inset 10px 0 0 #171310, inset -10px 0 0 #171310",
              }}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="(max-width: 768px) 58vw, 28rem"
                className="object-cover"
                draggable={false}
              />
              <figcaption className="absolute bottom-3 left-4 font-display text-sm italic text-ivory">
                {s.place}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <blockquote className="mx-auto mt-12 max-w-[28rem] px-6 md:px-12">
        <p className="font-display text-2xl font-medium leading-snug text-ink md:text-3xl">
          „Der Tisch war der Moment, über den alle noch Wochen später gesprochen haben.“
        </p>
        <footer className="mt-4 label text-ink/40">— Brandenburg</footer>
      </blockquote>

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
