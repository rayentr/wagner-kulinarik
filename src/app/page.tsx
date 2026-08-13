import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { MomentFilm } from "@/components/site/MomentFilm";
import { Pillars } from "@/components/site/Pillars";
import { Packages } from "@/components/site/Packages";
import { Flavors } from "@/components/site/Flavors";
import { Process } from "@/components/site/Process";
import { Proof } from "@/components/site/Proof";
import { Radius } from "@/components/site/Radius";
import { Inquiry } from "@/components/site/Inquiry";
import { Footer } from "@/components/site/Footer";
import { SiteCursor } from "@/components/site/SiteCursor";
import { ChapterRail } from "@/components/site/ChapterRail";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { VelocityField } from "@/components/site/VelocityField";

export default function Home() {
  return (
    <>
      <SiteCursor />
      <ChapterRail />
      <Nav />
      <VelocityField />
      <SmoothScroll>
        <main>
          <Hero />
          <Manifesto />
          <MomentFilm />
          <Pillars />
          <Packages />
          <Flavors />
          <Process />
          <Proof />
          <Radius />
          <Inquiry />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
