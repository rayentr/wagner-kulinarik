"use client";

import {
  useRef,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type Ref,
} from "react";
import { canUsePointerEffects, gsap, useGSAP } from "@/lib/gsap";

type MagneticChildProps = {
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
  className?: string;
};

type MagneticProps = {
  children: ReactElement<MagneticChildProps>;
  /** Pull strength in px at edge of hit area. Default 28. */
  strength?: number;
};

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/**
 * Soft magnetic pull for primary CTAs. Fine pointer only; no-ops on touch / reduced motion.
 */
export function Magnetic({ children, strength = 28 }: MagneticProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const childRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = wrap.current;
      if (!el || !canUsePointerEffects()) return;

      const target =
        (childRef.current ?? el.firstElementChild) as HTMLElement | null;
      if (!target) return;

      const xTo = gsap.quickTo(target, "x", {
        duration: 0.55,
        ease: "lc.soft",
      });
      const yTo = gsap.quickTo(target, "y", {
        duration: 0.55,
        ease: "lc.soft",
      });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        gsap.set(target, { x: 0, y: 0 });
      };
    },
    { scope: wrap, dependencies: [strength] },
  );

  if (!isValidElement(children)) return children;

  const child = cloneElement(children, {
    ref: mergeRefs(childRef, children.props.ref),
  });

  return (
    <span ref={wrap} className="inline-block will-change-transform">
      {child}
    </span>
  );
}
