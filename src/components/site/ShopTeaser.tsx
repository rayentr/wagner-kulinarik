import Image from "next/image";
import { SHOP_PRODUCTS } from "@/lib/catalog";

/**
 * Objects on a shelf — Euro as a stamp. Checkout lives in the app.
 */
export function ShopTeaser() {
  return (
    <section id="shop" className="bg-paper px-6 py-16 text-ink md:px-12 md:py-20">
      <div className="mx-auto max-w-[1500px]">
        <p className="label text-ink/45">Speisekammer</p>
        <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.2rem,4vw,3.6rem)] font-medium leading-[.95] tracking-[-.04em]">
          Was mitgeht.
        </h2>
        <p className="mt-4 max-w-[36ch] font-sans text-sm leading-relaxed text-ink/50">
          Preise in Euro. Bestellen in der App.
        </p>

        <div className="mt-14 border-b border-ink/20">
          <div className="flex items-end gap-6 overflow-x-auto pb-0 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-10">
            {SHOP_PRODUCTS.map((p, i) => (
              <article
                key={p.name}
                className={`flex-none bg-cream p-3 pb-8 shadow-[0_12px_28px_rgba(35,31,32,.08)] ${
                  i === 1 ? "w-[13rem] rotate-[1.8deg] md:w-[16rem]" : "w-[11.5rem] md:w-[14rem]"
                } ${i === 0 ? "rotate-[-2.2deg]" : ""} ${i === 2 ? "rotate-[-1.4deg]" : ""}`}
              >
                <div className="relative aspect-square overflow-hidden bg-night-soft">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="16rem"
                    className="object-cover"
                    style={{ transform: "scale(1.2)" }}
                  />
                </div>
                <p className="mt-4 px-1 font-display text-lg italic leading-none">
                  {p.name}
                </p>
                <p className="mt-2 px-1 font-sans text-xs text-ink/45">
                  {p.category}
                </p>
                <p className="mt-3 px-1 font-sans text-sm text-accent">{p.price}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
