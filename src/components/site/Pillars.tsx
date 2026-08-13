import Image from "next/image";
import { Reveal } from "./Reveal";
import { ParallaxMedia } from "./ParallaxMedia";

const PILLARS = [
  {
    title: "Hochzeit",
    text: "Menü, Buffet und Late-Night-Station — choreografiert für den schönsten Tag.",
    cta: "Hochzeit anfragen",
    type: "Hochzeit",
    image: "/images/wedding-desserts.jpg",
    alt: "Elegant gedeckter Hochzeitstisch",
  },
  {
    title: "Geburtstag & Feiern",
    text: "Geburtstage, Jubiläen und private Zusammenkünfte — Gastronomie mit Persönlichkeit.",
    cta: "Feier planen",
    type: "Geburtstag",
    image: "/images/celebration-cookies.jpg",
    alt: "Festlich angerichtete Speisen für eine private Feier",
  },
  {
    title: "Events & Corporate",
    text: "Launches, Hospitality und Team-Momente — repräsentativ, verlässlich, im Detail durchdacht.",
    cta: "Event anfragen",
    type: "Event",
    image: "/images/flavor-winter.jpg",
    alt: "Warm gestimmter Eventtisch für ein Corporate Gathering",
  },
];

export function Pillars() {
  return (
    <section className="bg-paper px-6 pb-36 pt-16 text-ink md:px-12 md:pb-48">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <div className="flex items-end justify-between border-b border-ink/20 pb-5">
            <p className="label text-accent">02 / Anlässe</p>
            <p className="hidden font-sans text-sm text-ink/45 md:block">
              Drei Welten. Eine Handschrift.
            </p>
          </div>
          <h2 className="mt-10 max-w-[13ch] font-display text-[clamp(3.4rem,7vw,7.5rem)] font-medium leading-[.9] tracking-[-.04em]">
            Für jeden Anlass die richtige <span className="italic">Geste.</span>
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-14 md:grid-cols-3 md:gap-7">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 0.08}
              className={`group ${i === 1 ? "md:mt-28" : i === 2 ? "md:mt-10" : ""}`}
            >
              <a
                href="#anfrage"
                data-prefill-type={p.type}
                className="block"
              >
                <div
                  className={`relative overflow-hidden ${
                    i === 0
                      ? "aspect-[3/4]"
                      : i === 1
                        ? "aspect-[4/5]"
                        : "aspect-[3/5]"
                  }`}
                >
                  <ParallaxMedia amount={6}>
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </ParallaxMedia>
                  <span className="label absolute left-4 top-4 z-10 bg-paper px-3 py-2 text-ink">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-3xl font-medium leading-none">
                  {p.title}
                </h3>
                <p className="mt-4 max-w-[38ch] font-body text-base leading-relaxed text-ink/65">
                  {p.text}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 border-b border-accent pb-1 font-sans text-sm font-medium text-ink transition-colors group-hover:text-accent">
                  {p.cta}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
