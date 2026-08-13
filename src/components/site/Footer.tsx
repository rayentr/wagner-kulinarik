export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/15 bg-cream text-ink">
      <div className="relative flex min-h-[42vw] flex-col justify-end px-6 pb-6 pt-20 md:min-h-[26vw] md:px-10 md:pb-8 md:pt-24">
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[46%] -translate-y-1/2 select-none text-center font-condensed text-[clamp(2rem,11vw,9rem)] font-semibold uppercase leading-[0.82] tracking-[-0.045em] text-ink"
        >
          Wagner Kulinarik
        </p>

        <div className="relative z-10 flex items-end justify-between gap-6">
          <p className="font-condensed text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink/70 md:text-xs">
            Wagner Kulinarik © {year}
          </p>
          <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
            <a
              href="#impressum"
              className="font-condensed text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink/70 transition-colors hover:text-ink md:text-xs"
            >
              Impressum
            </a>
            <a
              href="#datenschutz"
              className="font-condensed text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink/70 transition-colors hover:text-ink md:text-xs"
            >
              Datenschutz
            </a>
            <a
              href="#agb"
              className="font-condensed text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink/70 transition-colors hover:text-ink md:text-xs"
            >
              AGB
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
