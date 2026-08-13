import Image from "next/image";
import { Reveal } from "./Reveal";
import { ParallaxMedia } from "./ParallaxMedia";

const CHAPTERS = [
  {
    kicker: "Winter",
    name: "Winter Wärme",
    text: "Langsam gegartes Gemüse, dunkle Fonds und Gewürze, die im Kerzenlicht wirken. Wärme, die man schmeckt.",
    allergen: "saisonales Menü · vegetarische Variante auf Anfrage",
    image: "/images/flavor-winter.jpg",
    alt: "Warm gestimmtes Wintergericht mit dunkler Glasur",
  },
  {
    kicker: "Sommer",
    name: "Sommer Frische",
    text: "Zitrus, Kräuter und leichtes Grillgut. Hell, frisch und überraschend leicht — für lange Abende draußen.",
    allergen: "saisonales Menü · nussfreie Optionen möglich",
    image: "/images/flavor-summer.jpg",
    alt: "Helles Sommergericht mit frischen Kräutern und Zitrus",
  },
  {
    kicker: "Signature",
    name: "House Signature",
    text: "Unser Signature-Gang — präzise, wiedererkennbar, der Moment, an den Gäste sich erinnern.",
    allergen: "enthält je nach Menü Allergene · Details bei der Verkostung",
    image: "/images/flavor-signature.jpg",
    alt: "Detailaufnahme eines Signature-Gangs",
  },
];

export function Flavors() {
  return (
    <section className="bg-night px-6 py-24 md:px-12 md:py-36">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <p className="label text-brass">04 / Geschmack</p>
          <h2 className="mt-6 max-w-[11ch] font-display text-5xl font-medium leading-[.9] tracking-[-.045em] text-paper md:text-8xl">
            Geschmack als <span className="italic">Kapitel.</span>
          </h2>
        </Reveal>

        <div className="mt-20 flex flex-col gap-24 md:gap-40">
          {CHAPTERS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.05}>
              <article className="grid items-center gap-8 md:grid-cols-[1.1fr_.9fr] md:gap-20">
                <div
                  className={`group relative aspect-[4/5] overflow-hidden ${
                    i % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  <ParallaxMedia amount={6}>
                    <Image
                      src={c.image}
                      alt={c.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 55vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </ParallaxMedia>
                  <span className="label absolute left-0 top-0 z-10 bg-paper px-4 py-3 text-ink">
                    {c.kicker}
                  </span>
                </div>
                <div className={`flex flex-col justify-center ${i % 2 === 1 ? "md:text-right md:items-end" : ""}`}>
                  <span className="font-display text-7xl text-brass/25">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-4xl font-medium text-paper md:text-6xl">
                    {c.name}
                  </h3>
                  <p className="mt-5 max-w-[38ch] font-body text-lg leading-relaxed text-paper/65">
                    {c.text}
                  </p>
                  <p className="mt-7 max-w-[38ch] border-t border-paper/15 pt-4 font-sans text-xs uppercase tracking-wider text-paper/40">
                    {c.allergen}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
