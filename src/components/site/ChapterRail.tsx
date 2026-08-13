"use client";

import { useRef, useState, type MouseEvent } from "react";
import {
  gsap,
  ScrollTrigger,
  scrollToTarget,
  useGSAP,
  prefersReducedMotion,
} from "@/lib/gsap";

const CHAPTERS = [
  { id: "top", label: "Start" },
  { id: "moment", label: "Moment" },
  { id: "angebote", label: "Angebote" },
  { id: "ablauf", label: "Ablauf" },
  { id: "nachweis", label: "Momente" },
  { id: "anfrage", label: "Anfrage" },
] as const;

function go(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  scrollToTarget(href);
}

/**
 * Editorial chapter rail — ScrollTrigger active chapter + ScrollTo on click.
 * Hidden on small screens; quiet when reduced-motion.
 */
export function ChapterRail() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState("top");

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const triggers: ScrollTrigger[] = [];

      CHAPTERS.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return;
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: "top 45%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (self.isActive) setActive(id);
            },
          }),
        );
      });

      // Pins remount spacers after mount — single refresh, no per-section thrash
      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        const hit = triggers.find((t) => t.isActive);
        const el = hit?.trigger as HTMLElement | undefined;
        if (el?.id) setActive(el.id);
      }, 600);

      if (!reduce && root.current) {
        gsap.from(root.current, {
          opacity: 0,
          x: 12,
          duration: 0.9,
          delay: 1.8,
          ease: "lc.soft",
        });
      }

      return () => {
        window.clearTimeout(refreshTimer);
        triggers.forEach((t) => t.kill());
      };
    },
    { scope: root },
  );

  return (
    <nav
      ref={root}
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      aria-label="Kapitel"
    >
      <ul className="pointer-events-auto flex flex-col items-end gap-3">
        {CHAPTERS.map(({ id, label }) => {
          const isActive = active === id;
          const href = `#${id}`;
          return (
            <li key={id}>
              <a
                href={href}
                data-cursor="link"
                onClick={(e) => go(e, href)}
                className="group flex items-center gap-3"
                aria-current={isActive ? "true" : undefined}
                aria-label={label}
              >
                <span
                  className={`label origin-right transition-[opacity,transform,color] duration-400 ${
                    isActive
                      ? "translate-x-0 text-brass opacity-100"
                      : "translate-x-1 text-brass/50 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`block h-1.5 rounded-full shadow-[0_0_0_1px_rgba(23,19,16,0.15)] transition-[width,background-color] duration-400 ${
                    isActive
                      ? "w-6 bg-brass"
                      : "w-1.5 bg-brass/40 group-hover:bg-brass/70"
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
