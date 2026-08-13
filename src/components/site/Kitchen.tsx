import Image from "next/image";
import { KITCHEN_ITEMS, WARM_LQIP } from "@/lib/catalog";

/**
 * Magazine spread — one lead, the rest as columns. Not a card grid.
 */
export function Kitchen() {
  const [lead, ...rest] = KITCHEN_ITEMS;

  return (
    <section id="kueche" className="bg-paper px-6 pb-8 pt-8 text-ink md:px-12">
      <div className="mx-auto max-w-[1500px]">
        <p className="label text-ink/45">Die Küche</p>
        <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(2.8rem,6vw,6.2rem)] font-medium leading-[.9] tracking-[-.045em]">
          Was das Haus kocht.
        </h1>
        <p className="mt-5 max-w-[36ch] font-sans text-base leading-relaxed text-ink/55">
          Zum Stöbern. Der Abend wird vorn geplant.
        </p>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-8 lg:gap-y-16">
          <article className="lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-night-soft md:aspect-[5/4]">
              <Image
                src={lead.image}
                alt={lead.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                style={{ objectPosition: "50% 35%", transform: "scale(1.15)" }}
                placeholder="blur"
                blurDataURL={WARM_LQIP}
                priority
              />
            </div>
            <p className="label mt-5 text-ink/40">{lead.kind}</p>
            <h2 className="mt-2 font-display text-4xl font-medium leading-[.95] tracking-[-.03em] md:text-5xl">
              {lead.name}
            </h2>
            <p className="mt-4 max-w-[40ch] font-sans text-base leading-relaxed text-ink/60">
              {lead.text}
            </p>
          </article>

          <div className="flex flex-col gap-10 lg:col-span-5 lg:pt-24">
            {rest.map((item) => (
              <article key={item.name} className="grid grid-cols-[7rem_1fr] gap-4 sm:grid-cols-[9rem_1fr]">
                <div className="relative aspect-[3/4] overflow-hidden bg-night-soft">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="9rem"
                    className="object-cover"
                    style={{ transform: "scale(1.2)" }}
                  />
                </div>
                <div className="self-end pb-1">
                  <p className="label text-ink/40">{item.kind}</p>
                  <h3 className="mt-1 font-display text-2xl font-medium leading-none">
                    {item.name}
                  </h3>
                  <p className="mt-2 max-w-[28ch] font-sans text-sm leading-relaxed text-ink/55">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
