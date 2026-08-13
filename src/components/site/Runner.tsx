"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type RunnerProps = {
  children: ReactNode;
  /** Stays in the room while the runner travels — stage, place card. */
  overlay?: ReactNode;
  className?: string;
  onActiveChange?: (index: number) => void;
};

function isPinnedAxis() {
  if (typeof window === "undefined") return false;
  return (
    !prefersReducedMotion() &&
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 1024px)").matches
  );
}

function plateCount(track: HTMLElement) {
  return track.querySelectorAll("[data-plate]").length;
}

function indexFromProgress(progress: number, n: number) {
  if (n <= 1) return 0;
  return Math.round(gsap.utils.clamp(0, 1, progress) * (n - 1));
}

/**
 * Table runner — wheel maps to X on desktop; swipe on touch / reduced motion.
 * Active night is progress along the runner, not bounding-box (widths may differ).
 */
export function Runner({
  children,
  overlay,
  className = "",
  onActiveChange,
}: RunnerProps) {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const onActiveRef = useRef(onActiveChange);

  useEffect(() => {
    onActiveRef.current = onActiveChange;
  }, [onActiveChange]);

  useGSAP(
    () => {
      const pinEl = pin.current;
      const trackEl = track.current;
      if (!pinEl || !trackEl) return;

      const emit = (progress: number) => {
        const next = indexFromProgress(progress, plateCount(trackEl));
        if (next === activeRef.current) return;
        activeRef.current = next;
        onActiveRef.current?.(next);
      };

      const onScroll = () => {
        const max = trackEl.scrollWidth - trackEl.clientWidth;
        emit(max <= 0 ? 0 : trackEl.scrollLeft / max);
      };

      trackEl.addEventListener("scroll", onScroll, { passive: true });
      emit(0);

      if (!isPinnedAxis()) {
        return () => trackEl.removeEventListener("scroll", onScroll);
      }

      const distance = () =>
        Math.max(0, trackEl.scrollWidth - window.innerWidth);

      const tween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          pin: true,
          scrub: 0.45,
          start: "top top",
          end: () =>
            `+=${Math.max(distance() * 1.15, window.innerHeight * 2.4)}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          id: "table-runner",
          onUpdate(self) {
            emit(self.progress);
          },
          onRefresh(self) {
            emit(self.progress);
          },
        },
      });

      return () => {
        trackEl.removeEventListener("scroll", onScroll);
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(trackEl, { clearProps: "transform" });
      };
    },
    { scope: pin },
  );

  return (
    <div
      ref={pin}
      className={`relative lg:h-[100svh] lg:overflow-hidden ${className}`}
    >
      {overlay}
      <div
        ref={track}
        className="relative z-0 flex w-max snap-x snap-mandatory items-end gap-3 overflow-x-auto overscroll-x-contain px-6 pb-10 pt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:h-full lg:snap-none lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-16 lg:pl-[min(52vw,700px)] lg:pr-[18vw] lg:pt-28"
      >
        {children}
      </div>
    </div>
  );
}
