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
      <div className="mx-auto flex max-w-[1500px] flex-col items-start gap-6 px-6 pb-8 pt-12 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-10 sm:gap-y-8 md:px-10 md:pt-16">
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

      <div className="border-t border-border/60 px-6 pb-8 pt-8 md:px-10 md:pb-10 md:pt-10">
        <Image
          src="/images/wagner-kulinarik-logo.png"
          alt=""
          width={800}
          height={232}
          className="mx-auto h-auto w-[min(58vw,20rem)] max-w-full select-none object-contain md:w-[min(36vw,26rem)]"
          priority={false}
        />
        <p className="mt-6 text-center label text-muted">
          Wagner Kulinarik © {year}
        </p>
      </div>
    </footer>
  );
}
