"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type PassProps = {
  children: ReactNode;
  /** Word on the doors. */
  mark?: string;
};

/**
 * Kitchen pass — paper doors slide apart; the room walks toward you (scale + clip).
 */
export function Pass({ children, mark = "Die Nacht" }: PassProps) {
  const root = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const room = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const a = left.current;
      const b = right.current;
      const r = room.current;
      if (!el || !a || !b || !r) return;

      const pin =
        !prefersReducedMotion() &&
        window.matchMedia("(min-width: 1024px)").matches;

      if (!pin) {
        gsap.set(a, { xPercent: -100 });
        gsap.set(b, { xPercent: 100 });
        gsap.set(r, { scale: 1, clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 0.4,
          start: "top top",
          end: "+=90%",
          anticipatePin: 1,
          id: "night-pass",
        },
      });

      tl.to(a, { xPercent: -100, ease: "none", duration: 1 }, 0)
        .to(b, { xPercent: 100, ease: "none", duration: 1 }, 0)
        .fromTo(
          r,
          { scale: 1.14, clipPath: "inset(8% 12% 8% 12%)" },
          {
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            duration: 1,
          },
          0,
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative h-[100svh] overflow-hidden bg-night"
    >
      <div
        ref={room}
        className="absolute inset-0 origin-center will-change-transform"
      >
        {children}
      </div>
      <div
        ref={left}
        className="absolute inset-y-0 left-0 z-10 flex w-1/2 items-center justify-end bg-paper pr-4 pt-[env(safe-area-inset-top)]"
        aria-hidden
      >
        <span className="font-display text-3xl italic text-ink md:text-5xl">
          Die
        </span>
      </div>
      <div
        ref={right}
        className="absolute inset-y-0 right-0 z-10 flex w-1/2 items-center justify-start bg-paper pl-4 pt-[env(safe-area-inset-top)]"
        aria-hidden
      >
        <span className="font-display text-3xl italic text-ink md:text-5xl">
          {mark === "Die Nacht" ? "Nacht" : mark}
        </span>
      </div>
    </div>
  );
}
