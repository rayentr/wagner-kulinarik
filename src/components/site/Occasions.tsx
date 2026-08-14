"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { OCCASIONS } from "@/lib/catalog";
import {
  gsap,
  isCoarsePointer,
  prefersReducedMotion,
  scrollToTarget,
  useGSAP,
} from "@/lib/gsap";
import { useT } from "@/lib/locale";
import { shareNight } from "@/lib/share";
import { usePlateTilt } from "@/lib/tilt";
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

function subscribeCoarse(onChange: () => void) {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function askForNight(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  scrollToTarget("#anfrage");
}

export function Occasions() {
  const t = useT();
  const [active, setActive] = useState(0);
  const [served, setServed] = useState(0);
  const [open, setOpen] = useState(true);
  const [lifted, setLifted] = useState(true);
  const [shareNote, setShareNote] = useState("");
  const copyRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef(0);
  const swapTimer = useRef(0);
  const night = OCCASIONS[served];
  const coarse = useSyncExternalStore(
    subscribeCoarse,
    isCoarsePointer,
    () => false,
  );
  const { ref: tiltRef, photoRef, engage, look, rest } = usePlateTilt(
    coarse ? lifted : open,
  );

  const onPlate = useCallback((index: number) => {
    if (plateRef.current === index) return;
    plateRef.current = index;
    setActive(index);
    setOpen(false);
    setLifted(false);
    window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      setServed(index);
      if (!isCoarsePointer()) setOpen(true);
    }, prefersReducedMotion() ? 0 : 720);
  }, []);

  const onLifted = useCallback((next: boolean) => {
    setLifted(next);
    setOpen(next);
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
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-6 pt-[max(2rem,calc(env(safe-area-inset-top)+3.5rem))] md:px-12 lg:pt-12">
              <p className="label text-ink/45">Für welche Nacht</p>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-night/80 to-transparent motion-reduce:block motion-safe:hidden" />

            {/* The plate — the dish of the room, any width. */}
            <div className="absolute bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] left-4 right-4 top-[calc(env(safe-area-inset-top)+4.75rem)] z-10 hidden motion-safe:block lg:bottom-16 lg:left-6 lg:right-auto lg:top-28 lg:w-[min(48vw,640px)]">
              <div
                data-cursor="media"
                className="relative h-full [perspective:48rem]"
              >
                <div
                  ref={tiltRef}
                  className="h-full origin-center will-change-transform [transform-style:preserve-3d]"
                >
                <Cloche
                  open={coarse ? lifted : open}
                  liftable={!prefersReducedMotion()}
                  onLifted={onLifted}
                  onEngage={engage}
                  onLook={look}
                  onLookEnd={rest}
                  className="h-full"
                >
                  <div ref={photoRef} className="absolute inset-0">
                    <Image
                      src={night.image}
                      alt={night.alt}
                      fill
                      sizes="(max-width: 1023px) 70vw, 640px"
                      className="scale-[1.45] object-cover"
                      style={{ objectPosition: CROP[night.id] }}
                      priority={served === 0}
                    />
                  </div>
                </Cloche>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-night/75 to-transparent" />
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-20 px-6 text-center md:px-12 motion-safe:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))] motion-safe:left-4 motion-safe:right-4 motion-safe:px-0 motion-safe:text-left lg:bottom-20 lg:left-10 lg:right-auto lg:w-[min(44vw,600px)]">
              <div className="overflow-hidden">
                <div ref={copyRef}>
                  <h2 className="mx-auto max-w-[10ch] font-display text-[clamp(2.2rem,8vw,4.8rem)] font-medium leading-[.9] tracking-[-.04em] text-ivory motion-safe:mx-0">
                    {night.title}
                  </h2>
                  <p className="mx-auto mt-3 max-w-[28ch] font-sans text-sm leading-relaxed text-ivory/75 motion-safe:mx-0 lg:mt-4">
                    {night.text}
                  </p>
                </div>
              </div>
              <div className="pointer-events-auto mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 lg:mt-6">
                <Magnetic strength={18}>
                  <a
                    href="#anfrage"
                    data-prefill-type={night.type}
                    data-cursor="cta"
                    onClick={askForNight}
                    className="inline-flex min-h-11 items-center font-sans text-sm text-accent"
                  >
                    Diese Nacht →
                  </a>
                </Magnetic>
                <button
                  type="button"
                  data-cursor="link"
                  onClick={async () => {
                    const result = await shareNight({
                      title: `${night.title} — Wagner Kulinarik`,
                      text: night.text,
                      url: `${window.location.origin}/#anlaesse`,
                    });
                    if (result === "copied") setShareNote(t.app.copied);
                    else if (result === "shared") setShareNote(t.app.shared);
                    else setShareNote("");
                    window.setTimeout(() => setShareNote(""), 2200);
                  }}
                  className="inline-flex min-h-11 items-center font-sans text-sm text-ivory/70"
                >
                  {shareNote || t.app.share}
                </button>
              </div>
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
                on ? "z-10 motion-safe:brightness-100" : "z-0 motion-safe:brightness-[.65]"
              } w-[78vw] sm:w-[52vw] motion-safe:w-[12vw] lg:motion-safe:w-[8.5vw]`}
            >
              <div className="motion-safe:hidden">
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
              <div className="hidden motion-safe:block">
                <div className="relative h-[36dvh] overflow-hidden bg-night-soft lg:h-[42dvh]">
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
