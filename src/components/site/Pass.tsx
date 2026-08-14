"use client";

import { useRef, type ReactNode } from "react";
import { Observer } from "gsap/Observer";
import { bindRoomViewport, canPinRoom, gsap, roomHeight, useGSAP } from "@/lib/gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

type PassProps = {
  children: ReactNode;
  /** Word on the doors. */
  mark?: string;
};

/**
 * Kitchen pass — paper doors. Scroll or pull the seam; the room walks in (Z).
 */
export function Pass({ children, mark = "Die Nacht" }: PassProps) {
  const root = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const a = left.current;
      const b = right.current;
      const r = room.current;
      const word = hint.current;
      if (!el || !a || !b || !r) return;

      if (!canPinRoom()) {
        gsap.set(a, { xPercent: -100 });
        gsap.set(b, { xPercent: 100 });
        gsap.set(r, { scale: 1, clipPath: "inset(0% 0% 0% 0%)" });
        if (word) gsap.set(word, { autoAlpha: 0 });
        return;
      }

      const viewportH = () => roomHeight();

      const fit = () => {
        el.style.height = `${viewportH()}px`;
      };
      fit();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 0.4,
          start: "top top",
          end: () => `+=${viewportH() * 0.9}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          id: "night-pass",
          onUpdate(self) {
            if (word) {
              gsap.set(word, { autoAlpha: 1 - self.progress * 1.6 });
            }
          },
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

      const observer = Observer.create({
        target: el,
        type: "touch,pointer",
        tolerance: 8,
        preventDefault: false,
        onChangeX(self) {
          const st = tl.scrollTrigger;
          if (!st || Math.abs(self.deltaX) < Math.abs(self.deltaY) * 1.1) return;
          const ev = self.event as PointerEvent | TouchEvent | undefined;
          const clientX =
            ev && "clientX" in ev
              ? ev.clientX
              : ev && "touches" in ev && ev.touches[0]
                ? ev.touches[0].clientX
                : el.getBoundingClientRect().left + el.offsetWidth / 2;
          const mid =
            el.getBoundingClientRect().left + el.offsetWidth / 2;
          const fromLeft = clientX < mid;
          const opening = fromLeft ? self.deltaX < 0 : self.deltaX > 0;
          if (ev && "cancelable" in ev && ev.cancelable) ev.preventDefault();
          const delta = Math.abs(self.deltaX) * (opening ? 1.7 : -1.7);
          st.scroll(st.scroll() + delta);
        },
      });

      const unbind = bindRoomViewport({
        onFit: fit,
        onRefresh: () => tl.scrollTrigger?.refresh(),
      });

      return () => {
        unbind();
        observer.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative h-dvh overflow-hidden bg-night"
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
      <p
        ref={hint}
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 font-display text-sm italic text-ink/45"
      >
        Ziehen
      </p>
    </div>
  );
}
