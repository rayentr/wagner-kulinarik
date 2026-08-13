import { Reveal } from "./Reveal";

export function Radius() {
  return (
    <section className="bg-accent px-6 py-20 text-paper md:px-12 md:py-24">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label mb-4 text-paper/60">07 / Radius &amp; Logistik</p>
              <h2 className="max-w-xl font-display text-4xl font-medium leading-[.95] tracking-tight md:text-6xl">
                Wo wir Momente schaffen.
              </h2>
            </div>
            <div className="max-w-md">
              <p className="font-body text-lg leading-relaxed text-paper/78">
                Berlin &amp; Umland als Zuhause — Anfahrt darüber hinaus nach
                Absprache. Zertifizierte Hygiene, klare Allergen-Kennzeichnung
                und verlässliche Zeitfenster gehören selbstverständlich dazu.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
