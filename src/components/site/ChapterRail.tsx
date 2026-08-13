"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import {
  gsap,
  ScrollTrigger,
  scrollToTarget,
  useGSAP,
  prefersReducedMotion,
} from "@/lib/gsap";
import { useT } from "@/lib/locale";

function go(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  scrollToTarget(href);
}

export function ChapterRail() {
  const t = useT();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState("top");

  const chapters = useMemo(
    () => [
      { id: "top", label: t.chapter.start },
      { id: "anlaesse", label: t.nav.occasions },
      { id: "nacht", label: t.chapter.night },
      { id: "anfrage", label: t.nav.reserve },
    ],
    [t],
  );

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const triggers: ScrollTrigger[] = [];

      chapters.forEach(({ id }) => {
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

      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        const hit = triggers.find((tr) => tr.isActive);
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
        triggers.forEach((tr) => tr.kill());
      };
    },
    { scope: root, dependencies: [chapters] },
  );

  return (
    <nav
      ref={root}
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      aria-label={t.chapter.aria}
    >
      <ul className="pointer-events-auto flex flex-col items-end gap-3">
        {chapters.map(({ id, label }) => {
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
                  className={`font-display origin-right text-sm italic transition-[opacity,transform] duration-400 ${
                    isActive
                      ? "translate-x-0 bg-paper/90 px-2 py-0.5 text-ink opacity-100"
                      : "translate-x-1 bg-paper/90 px-2 py-0.5 text-ink opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`block h-px rounded-none shadow-none transition-[width,background-color] duration-400 ${
                    isActive
                      ? "w-8 bg-accent"
                      : "w-3 bg-ink/25 group-hover:bg-ink/50"
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
