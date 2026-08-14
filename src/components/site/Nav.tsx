"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { scrollToTarget } from "@/lib/gsap";
import { useT } from "@/lib/locale";

function handleNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  scrollToTarget(href);
}

export function Nav() {
  const t = useT();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const hash = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  const links = useMemo(
    () => [
      { href: hash("anlaesse"), label: t.nav.occasions },
      { href: hash("ablauf"), label: t.nav.process },
      { href: hash("nacht"), label: t.nav.night },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, onHome],
  );

  const reserveHref = hash("anfrage");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled || !onHome
          ? "border-b border-border bg-paper/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10 md:py-5">
        {onHome ? (
          <a
            href="#top"
            data-cursor="link"
            onClick={(e) => handleNavClick(e, "#top")}
            className="relative block shrink-0"
            aria-label={t.nav.home}
          >
            <Image
              src="/images/wagner-kulinarik-logo.png"
              alt="wagner KULINARIK"
              width={800}
              height={232}
              priority
              className={`h-7 w-auto object-contain transition-[filter] duration-500 sm:h-8 md:h-9 ${
                scrolled ? "" : "brightness-0 invert"
              }`}
            />
          </a>
        ) : (
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            data-cursor="link"
            className="relative block shrink-0"
            aria-label={t.nav.home}
          >
            <Image
              src="/images/wagner-kulinarik-logo.png"
              alt="wagner KULINARIK"
              width={800}
              height={232}
              priority
              className="h-7 w-auto object-contain sm:h-8 md:h-9"
            />
          </Link>
        )}

        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {links.map((l) => (
            <a
              key={l.href + l.label}
              href={l.href}
              data-cursor="link"
              onClick={(e) => handleNavClick(e, l.href)}
              className={`font-display text-[0.95rem] italic transition-colors ${
                scrolled || !onHome
                  ? "text-ink/50 hover:text-ink"
                  : "text-ivory/65 hover:text-ivory"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href={reserveHref}
            data-cursor="cta"
            onClick={(e) => handleNavClick(e, reserveHref)}
            className={`group relative inline-block font-sans text-sm font-medium ${
              scrolled || !onHome ? "text-ink" : "text-ivory"
            }`}
          >
            {t.nav.reserve}
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-300 group-hover:scale-x-100" />
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          data-cursor="link"
          className={`label inline-flex min-h-11 min-w-11 items-center justify-center lg:hidden ${
            scrolled || !onHome ? "text-ink" : "text-ivory"
          }`}
          aria-expanded={open}
          aria-label={t.nav.menu}
        >
          {open ? t.nav.close : t.nav.menu}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-paper px-6 py-3 lg:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.href + l.label}
                href={l.href}
                onClick={(e) => {
                  handleNavClick(e, l.href);
                  setOpen(false);
                }}
                className="flex min-h-11 items-center font-display text-xl italic text-ink/75"
              >
                {l.label}
              </a>
            ))}
            <a
              href={reserveHref}
              onClick={(e) => {
                handleNavClick(e, reserveHref);
                setOpen(false);
              }}
              className="flex min-h-11 items-center font-sans text-sm font-medium text-accent"
            >
              {t.nav.reserve} →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
