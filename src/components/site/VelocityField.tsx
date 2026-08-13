"use client";

import {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
  useGSAP,
} from "@/lib/gsap";

/**
 * Mild skew on [data-velocity] — skipped while any pin is active
 * so it never fights Moment Film / Ablauf.
 */
export function VelocityField() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const clamp = gsap.utils.clamp(-1.8, 1.8);
    let tween: gsap.core.Tween | null = null;

    const pinActive = () =>
      ScrollTrigger.getAll().some(
        (t) => t.isActive && (t.vars.pin || t.pin),
      );

    const apply = (skew: number) => {
      if (pinActive()) {
        gsap.set("[data-velocity]", { skewY: 0 });
        return;
      }
      const nodes = gsap.utils.toArray<HTMLElement>("[data-velocity]");
      if (!nodes.length) return;
      tween?.kill();
      tween = gsap.to(nodes, {
        skewY: skew,
        duration: 0.4,
        ease: "lc.soft",
        overwrite: "auto",
        onComplete: () => {
          gsap.to(nodes, {
            skewY: 0,
            duration: 0.55,
            ease: "lc.soft",
            overwrite: "auto",
          });
        },
      });
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) < 40) {
          apply(0);
          return;
        }
        apply(clamp(v / -520));
      },
    });

    return () => {
      st.kill();
      tween?.kill();
      gsap.set("[data-velocity]", { clearProps: "transform,skewY" });
    };
  });

  return null;
}
