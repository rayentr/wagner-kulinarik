"use client";

import { gsap } from "gsap";

type FlipMod = typeof import("gsap/Flip").Flip;
type DraggableMod = typeof import("gsap/Draggable").Draggable;

let flipPromise: Promise<FlipMod> | null = null;

/** Lazy Flip — service drawers. */
export function loadFlip() {
  if (!flipPromise) {
    flipPromise = import("gsap/Flip").then(({ Flip }) => {
      gsap.registerPlugin(Flip);
      return Flip;
    });
  }
  return flipPromise;
}

let dragPromise: Promise<DraggableMod> | null = null;

/** Lazy Draggable + Inertia — Proof reel and night polaroids. */
export function loadDraggable() {
  if (!dragPromise) {
    dragPromise = Promise.all([
      import("gsap/Draggable"),
      import("gsap/InertiaPlugin"),
    ]).then(([{ Draggable }, { InertiaPlugin }]) => {
      gsap.registerPlugin(Draggable, InertiaPlugin);
      return Draggable;
    });
  }
  return dragPromise;
}
