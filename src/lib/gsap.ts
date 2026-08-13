"use client";

/**
 * Lean GSAP core — shared by nav, reveals, scroll, cursor.
 * Heavy plugins (Flip, Draggable, DrawSVG, SplitText) load in the
 * components that need them so the first client chunk stays smaller.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { getLenis } from "@/lib/lenis-ref";

let registered = false;

function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase, useGSAP);

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

const SCROLL_TO_DURATION = 1.15;
const SCROLL_TO_EASE = "lc.soft";

/** Smooth scroll to a section id / element. */
export function scrollToTarget(
  target: string | Element,
  vars?: gsap.TweenVars,
) {
  if (typeof window === "undefined") return;

  const el =
    typeof target === "string"
      ? document.querySelector(target)
      : target;
  if (!(el instanceof HTMLElement)) return;

  if (prefersReducedMotion()) {
    el.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  const lenis = getLenis();
  lenis?.start();
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: SCROLL_TO_DURATION });
    return;
  }

  gsap.to(window, {
    duration: SCROLL_TO_DURATION,
    ease: SCROLL_TO_EASE,
    scrollTo: { y: el, autoKill: false, offsetY: 0 },
    overwrite: "auto",
    ...vars,
  });
}

export {
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  CustomEase,
  useGSAP,
  SCROLL_TO_DURATION,
  SCROLL_TO_EASE,
};
