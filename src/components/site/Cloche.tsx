"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Observer } from "gsap/Observer";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

type ClocheProps = {
  children: ReactNode;
  className?: string;
  /** Lid up — the dish is served. */
  open?: boolean;
  /** Finger lifts the lid (Z). Photograph still never fades. */
  liftable?: boolean;
  onLifted?: (open: boolean) => void;
  /** First press — iOS orientation permission lives here. */
  onEngage?: () => void;
  /** Open lid: X is looking, not the table. */
  onLook?: (deltaX: number, deltaY: number) => void;
  onLookEnd?: () => void;
};

function clip(lift: number) {
  const top = (1 - gsap.utils.clamp(0, 1, lift)) * 100;
  return `inset(${top}% 0% 0% 0%)`;
}

/**
 * Dish cover — clip lifts when open. Photograph never fades.
 * On a hand: drag up to lift, drag down to cover.
 */
export function Cloche({
  children,
  className = "",
  open = false,
  liftable = false,
  onLifted,
  onEngage,
  onLook,
  onLookEnd,
}: ClocheProps) {
  const root = useRef<HTMLDivElement>(null);
  const lid = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const primed = useRef(false);
  const lift = useRef(open ? 1 : 0);
  const dragging = useRef(false);
  const looking = useRef(false);
  const origin = useRef(0);
  const liftedRef = useRef(onLifted);
  const engageRef = useRef(onEngage);
  const lookRef = useRef(onLook);
  const lookEndRef = useRef(onLookEnd);

  useEffect(() => {
    liftedRef.current = onLifted;
    engageRef.current = onEngage;
    lookRef.current = onLook;
    lookEndRef.current = onLookEnd;
  }, [onLifted, onEngage, onLook, onLookEnd]);

  useGSAP(
    () => {
      const cover = lid.current;
      if (!cover) return;

      const wanted = open ? 1 : 0;
      if (!primed.current || prefersReducedMotion() || dragging.current) {
        lift.current = wanted;
        gsap.set(cover, { clipPath: clip(wanted) });
        if (hint.current) {
          gsap.set(hint.current, { autoAlpha: wanted < 0.18 ? 1 : 0 });
        }
        primed.current = true;
        return;
      }

      if (Math.abs(lift.current - wanted) <= 0.02) return;

      lift.current = wanted;
      gsap.to(cover, {
        clipPath: clip(wanted),
        duration: 0.72,
        ease: "lc.soft",
        overwrite: "auto",
      });
      if (hint.current) {
        gsap.to(hint.current, {
          autoAlpha: wanted < 0.18 ? 1 : 0,
          duration: 0.35,
          ease: "lc.soft",
          overwrite: "auto",
        });
      }
    },
    { scope: root, dependencies: [open] },
  );

  useGSAP(
    () => {
      const cover = lid.current;
      const well = root.current;
      if (!cover || !well || !liftable || prefersReducedMotion()) return;

      const apply = (value: number) => {
        lift.current = gsap.utils.clamp(0, 1, value);
        gsap.set(cover, { clipPath: clip(lift.current) });
        if (hint.current) {
          gsap.set(hint.current, {
            autoAlpha: lift.current < 0.18 ? 1 : 0,
          });
        }
      };

      const observer = Observer.create({
        target: well,
        type: "touch,pointer",
        tolerance: 6,
        preventDefault: false,
        onPress(self) {
          dragging.current = true;
          looking.current = false;
          origin.current = lift.current;
          engageRef.current?.();
          self.event?.stopPropagation();
        },
        onChangeX(self) {
          if (lift.current < 0.5) return;
          if (Math.abs(self.deltaX) < Math.abs(self.deltaY) * 1.05) return;
          looking.current = true;
          const ev = self.event;
          if (ev && "cancelable" in ev && ev.cancelable) ev.preventDefault();
          lookRef.current?.(self.deltaX, 0);
        },
        onChangeY(self) {
          if (looking.current && lift.current >= 0.5) {
            lookRef.current?.(0, self.deltaY);
            return;
          }
          if (Math.abs(self.deltaY) < Math.abs(self.deltaX)) return;
          const ev = self.event;
          if (ev && "cancelable" in ev && ev.cancelable) ev.preventDefault();
          const h = Math.max(well.getBoundingClientRect().height, 1);
          apply(origin.current - self.deltaY / h);
          origin.current = lift.current;
        },
        onRelease() {
          dragging.current = false;
          if (looking.current) {
            looking.current = false;
            lookEndRef.current?.();
            return;
          }
          const next = lift.current >= 0.5 ? 1 : 0;
          lift.current = next;
          gsap.to(cover, {
            clipPath: clip(next),
            duration: 0.55,
            ease: "lc.soft",
            overwrite: "auto",
          });
          if (hint.current) {
            gsap.to(hint.current, {
              autoAlpha: next < 0.18 ? 1 : 0,
              duration: 0.3,
              ease: "lc.soft",
              overwrite: "auto",
            });
          }
          liftedRef.current?.(next === 1);
        },
      });

      return () => {
        observer.kill();
      };
    },
    { scope: root, dependencies: [liftable] },
  );

  return (
    <div
      ref={root}
      className={`relative overflow-hidden bg-night-soft ${
        liftable ? "touch-none" : ""
      } ${className}`}
    >
      <div ref={lid} className="absolute inset-0">
        {children}
      </div>
      {liftable && (
        <p
          ref={hint}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center font-display text-sm italic text-ivory/55 opacity-0"
        >
          Heben
        </p>
      )}
    </div>
  );
}
