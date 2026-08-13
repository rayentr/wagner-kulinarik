import dynamic from "next/dynamic";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { Occasions } from "@/components/site/Occasions";
import { Process } from "@/components/site/Process";
import { Services } from "@/components/site/Services";
import { NightOf } from "@/components/site/NightOf";
import { AppInvite } from "@/components/site/AppInvite";
import { Footer } from "@/components/site/Footer";
import { SiteCursor } from "@/components/site/SiteCursor";
import { ChapterRail } from "@/components/site/ChapterRail";
import { Room } from "@/components/site/Room";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Amuse } from "@/components/site/Amuse";

/** Below-fold form island — own chunk. */
const Inquiry = dynamic(
  () =>
    import("@/components/site/Inquiry").then((m) => ({
      default: m.Inquiry,
    })),
);

export default function Home() {
  return (
    <>
      <SiteCursor />
      <ChapterRail />
      <Nav />
      <SmoothScroll>
        <Room>
          <main>
            <Hero />
            <Manifesto />
            <Occasions />
            <Process />
            <Services />
            <NightOf />
            <Inquiry />
            <AppInvite />
          </main>
        </Room>
        <Footer />
      </SmoothScroll>
      <Amuse />
    </>
  );
}
