import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Kitchen } from "@/components/site/Kitchen";
import { ShopTeaser } from "@/components/site/ShopTeaser";
import { Footer } from "@/components/site/Footer";
import { SiteCursor } from "@/components/site/SiteCursor";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Room } from "@/components/site/Room";
import { NOT_SHIPPED } from "@/lib/catalog";

const Proof = dynamic(
  () =>
    import("@/components/site/Proof").then((m) => ({ default: m.Proof })),
);

export const metadata: Metadata = {
  title: "Die Küche — Wagner Kulinarik",
  description:
    "Was das Haus kocht: Rezepte, Speisekammer, geteilte Nächte. Wagner Kulinarik, Berlin.",
};

export default function DiscoverPage() {
  return (
    <>
      <SiteCursor />
      <Nav />
      <SmoothScroll>
        <Room>
          <main>
            <div className="bg-paper px-6 pt-[calc(env(safe-area-inset-top)+4.5rem)] md:px-12">
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="inline-block font-display text-sm italic text-ink/45 transition-colors hover:text-ink"
              >
                ← Zum Haus
              </Link>
            </div>
            <Kitchen />
            <ShopTeaser />
            <Proof />
            <aside className="bg-paper px-6 pb-16 pt-10 md:px-12">
              <div className="mx-auto max-w-[1500px] border-t border-ink/10 pt-8">
                <p className="label text-ink/35">Hinter der Küche</p>
                <p className="mt-3 max-w-[48ch] font-sans text-xs leading-relaxed text-ink/40">
                  Noch nicht im Haus: {NOT_SHIPPED.join(" · ")}.
                </p>
              </div>
            </aside>
          </main>
        </Room>
        <Footer />
      </SmoothScroll>
    </>
  );
}
