"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Magnetic } from "./Magnetic";
import { scrollToTarget } from "@/lib/gsap";

const links = [
  { href: "#moment", label: "Moment" },
  { href: "#angebote", label: "Angebote" },
  { href: "#ablauf", label: "Abläufe" },
  { href: "#nachweis", label: "Momente" },
];

function handleNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  scrollToTarget(href);
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled
          ? "border-b border-ink/10 bg-paper/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <a
          href="#top"
          data-cursor="link"
          onClick={(e) => handleNavClick(e, "#top")}
          className={`font-display text-lg font-medium tracking-tight transition-colors ${
            scrolled ? "text-ink" : "text-ivory"
          }`}
        >
          Wagner Kulinarik
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-cursor="link"
              onClick={(e) => handleNavClick(e, l.href)}
              className={`label transition-colors ${
                scrolled
                  ? "text-ink/55 hover:text-ink"
                  : "text-ivory/70 hover:text-ivory"
              }`}
            >
              {l.label}
            </a>
          ))}
          <Magnetic strength={12}>
            <a
              href="#anfrage"
              data-cursor="cta"
              onClick={(e) => handleNavClick(e, "#anfrage")}
              className={`group relative inline-block font-sans text-sm font-medium ${
                scrolled ? "text-ink" : "text-ivory"
              }`}
            >
              Anfrage
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          </Magnetic>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          data-cursor="link"
          className={`label md:hidden ${scrolled ? "text-ink" : "text-ivory"}`}
          aria-label="Menü"
        >
          {open ? "Schließen" : "Menü"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  handleNavClick(e, l.href);
                  setOpen(false);
                }}
                className="label text-ink/70"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#anfrage"
              onClick={(e) => {
                handleNavClick(e, "#anfrage");
                setOpen(false);
              }}
              className="font-sans text-sm font-medium text-brass"
            >
              Anfrage senden →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
