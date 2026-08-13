"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { OCCASIONS } from "@/lib/catalog";
import { gsap, prefersReducedMotion, scrollToTarget, useGSAP } from "@/lib/gsap";
import { Cloche } from "./Cloche";
import { Magnetic } from "./Magnetic";
import { Runner } from "./Runner";

/** Chef crop — closer than the original frame, no new assets. */
const CROP: Record<(typeof OCCASIONS)[number]["id"], string> = {
  wedding: "50% 30%",
  birthday: "50% 45%",
  corporate: "55% 40%",
  "private-dinner": "50% 60%",
  party: "40% 50%",
  family: "50% 35%",
};

function askForNight(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  scrollToTarget("#anfrage");
}

export function Occasions() {
  const [active, setActive] = useState(0);
  const [served, setServed] = useState(0);
  const [open, setOpen] = useState(true);
  const copyRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef(0);
  const swapTimer = useRef(0);
  const night = OCCASIONS[served];

  const onPlate = useCallback((index: number) => {
    if (plateRef.current === index) return;
    plateRef.current = index;
    setActive(index);
    setOpen(false);
    window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      setServed(index);
      setOpen(true);
    }, prefersReducedMotion() ? 0 : 720);
  }, []);

  useEffect(() => () => window.clearTimeout(swapTimer.current), []);

  const copyPrimed = useRef(false);
  useGSAP(
    () => {
      const el = copyRef.current;
      if (!el) return;
      if (!copyPrimed.current || prefersReducedMotion()) {
        gsap.set(el, { yPercent: 0 });
        copyPrimed.current = true;
        return;
      }
      gsap.fromTo(
        el,
        { yPercent: 28 },
        { yPercent: 0, duration: 0.7, ease: "lc.soft" },
      );
    },
    { dependencies: [served], revertOnUpdate: true },
  );

  return (
    <section id="anlaesse" className="bg-paper text-ink">
      <Runner
        onActiveChange={onPlate}
        overlay={
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-8 md:px-12 lg:pt-12">
              <p className="label text-ink/45">Für welche Nacht</p>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-night/80 to-transparent lg:hidden" />

            {/* The plate — desktop; on touch the runner itself is the dish. */}
            <div className="absolute bottom-16 left-6 top-28 z-10 hidden w-[min(48vw,640px)] lg:block">
              <a
                href="#anfrage"
                data-prefill-type={night.type}
                data-cursor="cta"
                onClick={askForNight}
                className="relative block h-full"
              >
                <Cloche open={open} className="h-full">
                  <Image
                    src={night.image}
                    alt={night.alt}
                    fill
                    sizes="640px"
                    className="object-cover"
                    style={{
                      objectPosition: CROP[night.id],
                      transform: "scale(1.45)",
                    }}
                    priority={served === 0}
                  />
                </Cloche>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-night/75 to-transparent" />
              </a>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 px-6 text-center md:px-12 lg:bottom-20 lg:left-10 lg:right-auto lg:w-[min(44vw,600px)] lg:px-0 lg:text-left">
              <div className="overflow-hidden">
                <div ref={copyRef}>
                  <h2 className="mx-auto max-w-[10ch] font-display text-[clamp(2.6rem,5vw,4.8rem)] font-medium leading-[.9] tracking-[-.04em] text-ivory lg:mx-0">
                    {night.title}
                  </h2>
                  <p className="mx-auto mt-4 max-w-[28ch] font-sans text-sm leading-relaxed text-ivory/75 lg:mx-0">
                    {night.text}
                  </p>
                </div>
              </div>
              <Magnetic strength={18}>
                <a
                  href="#anfrage"
                  data-prefill-type={night.type}
                  data-cursor="cta"
                  onClick={askForNight}
                  className="pointer-events-auto mt-6 inline-block font-sans text-sm text-accent"
                >
                  Diese Nacht →
                </a>
              </Magnetic>
            </div>
          </>
        }
      >
        {OCCASIONS.map((p, i) => {
          const on = i === active;
          return (
            <article
              key={p.id}
              data-plate
              className={`relative flex-none snap-center ${
                on ? "z-10 lg:brightness-100" : "z-0 lg:brightness-[.65]"
              } w-[78vw] sm:w-[52vw] lg:w-[8.5vw]`}
            >
              <div className="lg:hidden">
                {on ? (
                  <a
                    href="#anfrage"
                    data-prefill-type={p.type}
                    onClick={askForNight}
                    className="block"
                  >
                    <PlatePhoto
                      src={p.image}
                      alt={p.alt}
                      crop={CROP[p.id]}
                      open={open && on}
                      sizes="78vw"
                    />
                  </a>
                ) : (
                  <PlatePhoto
                    src={p.image}
                    alt={p.alt}
                    crop={CROP[p.id]}
                    open={false}
                    sizes="78vw"
                  />
                )}
              </div>
              <div className="hidden lg:block">
                <div className="relative h-[42svh] overflow-hidden bg-night-soft">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="12vw"
                    className="object-cover"
                    style={{
                      objectPosition: CROP[p.id],
                      transform: "scale(1.5)",
                    }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </Runner>
    </section>
  );
}

function PlatePhoto({
  src,
  alt,
  crop,
  open,
  sizes,
}: {
  src: string;
  alt: string;
  crop: string;
  open: boolean;
  sizes: string;
}) {
  return (
    <Cloche open={open} className="aspect-[4/5]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: crop, transform: "scale(1.45)" }}
      />
    </Cloche>
  );
}
