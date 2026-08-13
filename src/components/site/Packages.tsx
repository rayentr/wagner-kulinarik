"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "./Reveal";
import { Flip, gsap, prefersReducedMotion, scrollToTarget } from "@/lib/gsap";

const TIERS = [
  {
    name: "Atelier",
    forWho: "Kleinere Feiern — nah, ruhig, präzise.",
    guests: "bis 40 Gäste",
    price: "ab Anfrage",
    line: "Ein intimer Tisch. Wenige Hände. Volle Aufmerksamkeit.",
    bullets: [
      "Kuratiertes Set-Menü",
      "Klassische Präsentation",
      "Aufbau im Zeitfenster",
      "Persönliche Abstimmung",
    ],
    image: "/images/hero-dessert-table.jpg",
    featured: false,
    tone: "paper" as const,
  },
  {
    name: "Signature",
    forWho: "Die meisten Hochzeiten & Events.",
    guests: "40–120 Gäste",
    price: "ab Anfrage",
    line: "Die Buffet-Inszenierung, die den Raum trägt — und den Abend erinnert.",
    bullets: [
      "Buffet & Styling",
      "Saisonale Signature-Kreationen",
      "Service während des Events",
      "Auf- und Abbau inklusive",
    ],
    image: "/images/gallery-event.jpg",
    featured: true,
    tone: "night" as const,
  },
  {
    name: "Couture",
    forWho: "Vollständig maßgeschneidert.",
    guests: "120+ Gäste",
    price: "ab Anfrage",
    line: "Architektur aus Geschmack — von der Verkostung bis zur Leitung am Tag.",
    bullets: [
      "Bespoke Menü-Architektur",
      "Verkostung & Konzept-Session",
      "On-Site Leitung am Tag",
      "Vollständige Choreografie",
    ],
    image: "/images/wedding-desserts.jpg",
    featured: false,
    tone: "cream" as const,
  },
];

export function Packages() {
  const [open, setOpen] = useState<string | null>("Signature");
  const sectionRef = useRef<HTMLElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const toggleOpen = (name: string) => {
    const root = sectionRef.current;
    if (root && !prefersReducedMotion()) {
      flipState.current = Flip.getState(
        root.querySelectorAll("[data-pack-details]"),
      );
    }
    setOpen((prev) => (prev === name ? null : name));
  };

  useLayoutEffect(() => {
    if (!flipState.current || prefersReducedMotion()) return;
    Flip.from(flipState.current, {
      duration: 0.55,
      ease: "lc.soft",
      nested: true,
      absolute: false,
      onComplete: () => {
        const root = sectionRef.current;
        if (!root) return;
        gsap.set(root.querySelectorAll("[data-pack-details]"), {
          clearProps: "transform,opacity",
        });
      },
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "lc.soft" },
        ),
      onLeave: (els) =>
        gsap.to(els, { opacity: 0, duration: 0.22, ease: "power2.in" }),
    });
    flipState.current = null;
  }, [open]);

  return (
    <section id="angebote" ref={sectionRef} className="bg-paper text-ink">
      <div className="mx-auto max-w-[1500px] px-6 pt-24 md:px-12 md:pt-32">
        <Reveal>
          <div className="grid gap-8 border-b border-ink/15 pb-10 md:grid-cols-[.55fr_1.45fr] md:items-end">
            <p className="label text-accent">03 / Angebote</p>
            <h2 className="max-w-[12ch] font-display text-5xl font-medium leading-[.95] tracking-[-.04em] md:text-7xl">
              Drei Welten. Ein Moment.
            </h2>
          </div>
        </Reveal>
      </div>

      <div className="mt-0">
        {TIERS.map((t, i) => {
          const isOpen = open === t.name;
          const dark = t.tone === "night";
          const cream = t.tone === "cream";

          return (
            <article
              key={t.name}
              data-cursor="explore"
              className={`relative min-h-[88svh] overflow-hidden ${
                dark
                  ? "bg-night text-ivory"
                  : cream
                    ? "bg-cream text-ink"
                    : "bg-paper text-ink"
              }`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div
                  data-velocity
                  className="absolute inset-0 will-change-transform"
                >
                  <Image
                    src={t.image}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
                <div
                  className={`absolute inset-0 ${
                    dark
                      ? "bg-gradient-to-r from-night/90 via-night/55 to-night/25"
                      : "bg-gradient-to-r from-paper/92 via-paper/70 to-paper/20"
                  }`}
                />
              </div>

              <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-[1500px] flex-col justify-end px-6 py-16 md:px-12 md:py-20 lg:justify-center">
                <div className="max-w-xl">
                  <div className="flex items-center gap-4">
                    <span
                      className={`label ${dark ? "text-brass" : "text-accent"}`}
                    >
                      0{i + 1} / {t.guests}
                    </span>
                    {t.featured && (
                      <span
                        className={`label ${dark ? "text-ivory/55" : "text-ink/45"}`}
                      >
                        Meist gewählt
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-6xl font-medium leading-none tracking-[-.04em] md:text-8xl">
                    {t.name}
                  </h3>
                  <p
                    className={`mt-4 font-sans text-sm ${dark ? "text-ivory/55" : "text-ink/50"}`}
                  >
                    {t.forWho}
                  </p>
                  <p
                    className={`mt-6 max-w-[34ch] font-body text-xl leading-relaxed ${
                      dark ? "text-ivory/80" : "text-ink/75"
                    }`}
                  >
                    {t.line}
                  </p>
                  <p
                    className={`mt-4 font-display text-2xl ${dark ? "text-brass" : "text-accent"}`}
                  >
                    {t.price}
                  </p>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <a
                      href="#anfrage"
                      data-cursor="cta"
                      data-prefill-budget={t.name}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToTarget("#anfrage");
                      }}
                      className={`px-7 py-3.5 font-sans text-sm font-medium transition-colors ${
                        dark
                          ? "bg-accent text-paper hover:bg-[#ca5138]"
                          : "bg-ink text-paper hover:bg-night"
                      }`}
                    >
                      Dieses Angebot anfragen
                    </a>
                    <button
                      type="button"
                      data-cursor="link"
                      onClick={() => toggleOpen(t.name)}
                      className={`group inline-flex items-center gap-2 border-b pb-1 font-sans text-sm font-medium ${
                        dark
                          ? "border-ivory/40 text-ivory"
                          : "border-ink/40 text-ink"
                      }`}
                    >
                      {isOpen ? "Details schließen" : "Was enthalten ist"}
                      <span
                        className={`transition-transform duration-300 ${
                          isOpen ? "rotate-90" : "group-hover:translate-x-1"
                        }`}
                      >
                        →
                      </span>
                    </button>
                  </div>

                  <div
                    data-pack-details
                    className={isOpen ? "mt-8" : ""}
                    style={{ display: isOpen ? "block" : "none" }}
                  >
                    <ul>
                      {t.bullets.map((b) => (
                        <li
                          key={b}
                          className={`flex items-start gap-3 border-t py-3 font-body text-[15px] ${
                            dark
                              ? "border-ivory/15 text-ivory/75"
                              : "border-ink/15 text-ink/70"
                          }`}
                        >
                          <span
                            className={`mt-2 h-1 w-1 flex-none ${
                              dark ? "bg-brass" : "bg-accent"
                            }`}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="bg-paper px-6 py-8 text-right font-sans text-sm text-ink/45 md:px-12">
        Gästezahlen und Preise stimmen wir individuell auf Ihren Anlass ab.
      </p>
    </section>
  );
}
