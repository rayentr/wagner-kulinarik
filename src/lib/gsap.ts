"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Kill switch — off while Moment Film + Ablauf pins; re-enable if desired. */
export const USE_SCROLL_SMOOTHER = false;

function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollToPlugin,
    ScrollSmoother,
    SplitText,
    CustomEase,
    Flip,
    DrawSVGPlugin,
    Draggable,
    InertiaPlugin,
    MorphSVGPlugin,
    useGSAP,
  );

  CustomEase.create("lc.luxury", "M0,0 C0.16,1 0.3,1 1,1");
  CustomEase.create("lc.soft", "M0,0 C0.22,0.61 0.36,1 1,1");
  CustomEase.create("lc.snap", "M0,0 C0.2,0.7 0.1,1 1,1");

  gsap.defaults({ duration: 1.05, ease: "lc.luxury" });
  registered = true;
}

registerGsap();

/** Fine pointer + motion allowed — custom cursor / magnetic live here. */
export function canUsePointerEffects() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Desktop-only smoother — never on touch / coarse pointer / reduced motion. */
export function canUseScrollSmoother() {
  if (typeof window === "undefined" || !USE_SCROLL_SMOOTHER) return false;
  if (prefersReducedMotion()) return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 1024px)").matches &&
    !window.matchMedia("(hover: none)").matches
  );
}

const SCROLL_TO_DURATION = 1.15;
const SCROLL_TO_EASE = "lc.soft";

/** Smooth scroll to a section id / element. Uses ScrollSmoother when active. */
export function scrollToTarget(
  target: string | Element,
  vars?: gsap.TweenVars,
) {
  if (typeof window === "undefined") return;

  if (prefersReducedMotion()) {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(target, true, "top top");
    return;
  }

  gsap.to(window, {
    duration: SCROLL_TO_DURATION,
    ease: SCROLL_TO_EASE,
    scrollTo: { y: target, autoKill: false, offsetY: 0 },
    overwrite: "auto",
    ...vars,
  });
}

export {
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  ScrollSmoother,
  SplitText,
  CustomEase,
  Flip,
  DrawSVGPlugin,
  Draggable,
  InertiaPlugin,
  MorphSVGPlugin,
  useGSAP,
  SCROLL_TO_DURATION,
  SCROLL_TO_EASE,
};
