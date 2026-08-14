"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Observer } from "gsap/Observer";
import { bindRoomViewport, canPinRoom, gsap, roomHeight, ScrollTrigger, useGSAP } from "@/lib/gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

type RunnerProps = {
  children: ReactNode;
  /** Stays in the room while the runner travels — stage, place card. */
  overlay?: ReactNode;
  className?: string;
  onActiveChange?: (index: number) => void;
};

function plateCount(track: HTMLElement) {
  return track.querySelectorAll("[data-plate]").length;
}

function indexFromProgress(progress: number, n: number) {
  if (n <= 1) return 0;
  return Math.round(gsap.utils.clamp(0, 1, progress) * (n - 1));
}

/**
 * Table runner — vertical scroll maps to X; a finger may also pan the cloth.
 * Reduced motion: swipe the dishes, no pin.
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

      if (!canPinRoom()) {
        const onScroll = () => {
          const max = trackEl.scrollWidth - trackEl.clientWidth;
          emit(max <= 0 ? 0 : trackEl.scrollLeft / max);
        };
        trackEl.addEventListener("scroll", onScroll, { passive: true });
        emit(0);
        return () => trackEl.removeEventListener("scroll", onScroll);
      }

      const viewportH = () => roomHeight();
      const fit = () => {
        pinEl.style.height = `${viewportH()}px`;
      };
      fit();

      const distance = () =>
        Math.max(0, trackEl.scrollWidth - window.innerWidth);

      emit(0);

      const tween = gsap.to(trackEl, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          pin: true,
          scrub: 0.45,
          start: "top top",
          end: () =>
            `+=${Math.max(distance() * 1.15, viewportH() * 2.4)}`,
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

      const observer = Observer.create({
        target: pinEl,
        type: "touch,pointer",
        tolerance: 12,
        preventDefault: false,
        onChangeX(self) {
          if (Math.abs(self.deltaX) < Math.abs(self.deltaY) * 1.15) return;
          const st =
            tween.scrollTrigger ?? ScrollTrigger.getById("table-runner");
          if (!st) return;
          const ev = self.event;
          if (ev && "cancelable" in ev && ev.cancelable) ev.preventDefault();
          st.scroll(st.scroll() - self.deltaX * 1.35);
        },
      });

      const unbind = bindRoomViewport({
        onFit: fit,
        onRefresh: () => tween.scrollTrigger?.refresh(),
      });

      return () => {
        unbind();
        observer.kill();
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
      className={`relative overflow-x-clip motion-safe:h-dvh motion-safe:overflow-hidden ${className}`}
    >
      {overlay}
      <div
        ref={track}
        className="relative z-0 flex w-max items-end gap-3 px-6 pb-10 pt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:overflow-x-auto motion-reduce:overscroll-x-contain motion-safe:h-full motion-safe:snap-none motion-safe:gap-4 motion-safe:overflow-hidden motion-safe:px-0 motion-safe:pb-16 motion-safe:pl-[min(68vw,20rem)] motion-safe:pr-[16vw] motion-safe:pt-24 lg:motion-safe:gap-5 lg:motion-safe:pl-[min(52vw,700px)] lg:motion-safe:pr-[18vw] lg:motion-safe:pt-28"
      >
        {children}
      </div>
    </div>
  );
}
