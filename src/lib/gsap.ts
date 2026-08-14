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

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Mouse / trackpad — cursor and magnetic. Not the definition of the room. */
export function isFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Fine pointer + motion allowed — custom cursor / magnetic live here. */
export function canUsePointerEffects() {
  return isFinePointer() && !prefersReducedMotion();
}

/** Pins, Observer, doors — the house exists at 390px. Width is not a gate. */
export function canPinRoom() {
  if (typeof window === "undefined") return false;
  return !prefersReducedMotion();
}

/** Visible room height — iOS chrome included. */
export function roomHeight() {
  if (typeof window === "undefined") return 0;
  return window.visualViewport?.height ?? window.innerHeight;
}

type RoomViewportOpts = {
  onFit?: () => void;
  onRefresh?: () => void;
  /** Skip refresh while a room is holding the page. */
  isHeld?: () => boolean;
};

/**
 * Fit rooms to the live viewport. Resize only — visualViewport *scroll*
 * is iOS chrome and will refresh pins until the pass traps.
 */
export function bindRoomViewport({ onFit, onRefresh, isHeld }: RoomViewportOpts) {
  let timer = 0;
  const onResize = () => {
    onFit?.();
    if (isHeld?.()) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (isHeld?.()) return;
      onRefresh?.();
    }, 140);
  };
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
  onFit?.();
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", onResize);
  };
}

/** WebGL grain — desktop only. Coarse and thin CPUs skip the shader. */
export function canUseGrain() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion() || isCoarsePointer()) return false;
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores < 4) return false;
  return true;
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
