"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleToggle, useT } from "@/lib/locale";

/**
 * After dinner — contact, language, legal. The kitchen is a walk, not a sitemap.
 */
export function Footer() {
  const t = useT();
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const f = t.footer;
  const atHome = pathname === "/";

  return (
    <footer className="border-t border-border bg-paper pb-[env(safe-area-inset-bottom)] text-ink">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-x-10 gap-y-8 px-6 pb-10 pt-12 md:px-10 md:pt-16">
        <div>
          <a
            href={`mailto:${f.email}`}
            className="font-sans text-sm text-ink/70 transition-colors hover:text-ink"
          >
            {f.email}
          </a>
          <p className="mt-1 font-sans text-sm text-ink/40">{f.location}</p>
        </div>

        <LocaleToggle />

        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-sans text-sm text-ink/50">
          <a href="#impressum" id="impressum" className="hover:text-ink">
            {f.impressum}
          </a>
          <a href="#datenschutz" id="datenschutz" className="hover:text-ink">
            {f.privacy}
          </a>
          <a href="#agb" id="agb" className="hover:text-ink">
            {f.terms}
          </a>
        </nav>

        {atHome ? (
          <Link
            href="/discover"
            transitionTypes={["nav-forward"]}
            className="font-display text-sm italic text-accent"
          >
            Die Küche →
          </Link>
        ) : (
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="font-display text-sm italic text-ink/45"
          >
            ← Zum Haus
          </Link>
        )}
      </div>

      <div className="relative flex min-h-[28vw] flex-col justify-end px-6 pb-6 pt-10 md:min-h-[16vw] md:px-10 md:pb-8 lg:min-h-[12vw]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[46%] flex -translate-y-1/2 justify-center px-6 md:px-12"
        >
          <Image
            src="/images/wagner-kulinarik-logo.png"
            alt=""
            width={800}
            height={232}
            className="h-auto w-[min(88vw,44rem)] max-w-full select-none object-contain"
            priority={false}
          />
        </div>
        <p className="relative z-10 label text-muted">
          Wagner Kulinarik © {year}
        </p>
      </div>
    </footer>
  );
}
