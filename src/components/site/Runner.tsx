"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Observer } from "gsap/Observer";
import {
  bindRoomViewport,
  canPinRoom,
  gsap,
  roomHeight,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";
import { getLenis } from "@/lib/lenis-ref";
import { playStationTick } from "@/lib/tick";

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

/** Wait until the cloche has closed, swapped, and lifted. */
const SERVE_MS = 1550;

/**
 * Table runner — one night per scroll. The page holds until the dish is served.
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

      const n = () => plateCount(trackEl);

      const emit = (index: number) => {
        const next = gsap.utils.clamp(0, Math.max(0, n() - 1), index);
        if (next === activeRef.current) return;
        activeRef.current = next;
        onActiveRef.current?.(next);
      };

      if (!canPinRoom()) {
        const onScroll = () => {
          const max = trackEl.scrollWidth - trackEl.clientWidth;
          const count = n();
          if (count <= 1 || max <= 0) {
            emit(0);
            return;
          }
          emit(Math.round((trackEl.scrollLeft / max) * (count - 1)));
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

      const xFor = (index: number) => {
        const count = n();
        if (count <= 1) return 0;
        return -distance() * (index / (count - 1));
      };

      let current = 0;
      let animating = false;
      let failsafe = 0;

      const place = (index: number) => {
        current = index;
        activeRef.current = index;
        gsap.set(trackEl, { x: xFor(index) });
        onActiveRef.current?.(index);
      };

      place(0);

      const go = (index: number) => {
        const count = n();
        if (animating || index === current || index < 0 || index >= count) {
          return;
        }
        animating = true;
        playStationTick();
        current = index;
        emit(index);

        window.clearTimeout(failsafe);
        failsafe = window.setTimeout(() => {
          animating = false;
        }, SERVE_MS);

        gsap.to(trackEl, {
          x: xFor(index),
          duration: 0.85,
          ease: "lc.soft",
          overwrite: "auto",
        });
      };

      const observer = Observer.create({
        target: pinEl,
        type: "wheel,touch,pointer",
        wheelSpeed: -1,
        tolerance: 36,
        preventDefault: true,
        ignore: "[data-runner-next], a, button",
        onUp: () => {
          if (animating) return;
          if (current >= n() - 1) {
            release(1);
            return;
          }
          go(current + 1);
        },
        onDown: () => {
          if (animating) return;
          if (current <= 0) {
            release(-1);
            return;
          }
          go(current - 1);
        },
      });
      observer.disable();

      let gated = false;
      let gateTimer = 0;

      const lockTouch = (on: boolean) => {
        pinEl.style.touchAction = on ? "none" : "";
        document.documentElement.style.overscrollBehavior = on ? "none" : "";
      };

      const hold = () => {
        getLenis()?.stop();
        lockTouch(true);
        observer.enable();
      };

      const free = () => {
        window.clearTimeout(failsafe);
        animating = false;
        lockTouch(false);
        observer.disable();
        getLenis()?.start();
      };

      const jump = (y: number) => {
        gated = true;
        window.clearTimeout(gateTimer);
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true });
        else window.scrollTo(0, y);
        gateTimer = window.setTimeout(() => {
          gated = false;
        }, 280);
      };

      const release = (direction: number) => {
        free();
        const pass = ScrollTrigger.getById("table-runner");
        if (!pass) return;
        const gap = Math.max(28, viewportH() * 0.06);
        jump(
          direction > 0
            ? pass.end + gap
            : Math.max(0, pass.start - gap),
        );
      };

      const st = ScrollTrigger.create({
        trigger: pinEl,
        pin: true,
        start: "top top",
        end: () => `+=${viewportH() * 1.4}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        id: "table-runner",
        onEnter: () => {
          if (gated || observer.isEnabled) return;
          place(0);
          hold();
        },
        onEnterBack: () => {
          if (gated || observer.isEnabled) return;
          place(n() - 1);
          hold();
        },
        onLeave: () => {
          if (gated || !observer.isEnabled) return;
          free();
        },
        onLeaveBack: () => {
          if (gated || !observer.isEnabled) return;
          free();
        },
      });

      const nextBtn = pinEl.querySelector<HTMLButtonElement>(
        "[data-runner-next]",
      );
      const onNext = () => {
        if (!observer.isEnabled) return;
        if (animating) return;
        if (current >= n() - 1) release(1);
        else go(current + 1);
      };
      nextBtn?.addEventListener("click", onNext);

      const askLink = pinEl.querySelector<HTMLAnchorElement>(
        'a[href="#anfrage"]',
      );
      const onAsk = () => {
        if (observer.isEnabled) free();
      };
      askLink?.addEventListener("click", onAsk);

      const unbind = bindRoomViewport({
        onFit: fit,
        onRefresh: () => {
          gsap.set(trackEl, { x: xFor(current) });
          st.refresh();
        },
        isHeld: () => observer.isEnabled,
      });

      const onKey = (e: KeyboardEvent) => {
        if (!observer.isEnabled) return;
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (e.key === "Escape") {
          e.preventDefault();
          release(1);
          return;
        }
        if (animating) return;
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "ArrowRight") {
          e.preventDefault();
          if (current >= n() - 1) release(1);
          else go(current + 1);
        }
        if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          if (current <= 0) release(-1);
          else go(current - 1);
        }
      };
      window.addEventListener("keydown", onKey);

      const onHide = () => {
        if (document.hidden && observer.isEnabled) free();
      };
      document.addEventListener("visibilitychange", onHide);

      return () => {
        window.removeEventListener("keydown", onKey);
        document.removeEventListener("visibilitychange", onHide);
        nextBtn?.removeEventListener("click", onNext);
        askLink?.removeEventListener("click", onAsk);
        unbind();
        window.clearTimeout(failsafe);
        window.clearTimeout(gateTimer);
        free();
        observer.kill();
        st.kill();
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
      <button
        type="button"
        data-runner-next
        data-cursor="link"
        aria-label="Nächste Nacht"
        className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-6 z-30 hidden min-h-11 font-sans text-sm text-ivory/80 motion-safe:block md:right-10"
      >
        Weiter
      </button>
    </div>
  );
}
