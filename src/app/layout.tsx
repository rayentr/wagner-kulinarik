import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";
import { t } from "@/lib/copy";
import { LocaleProvider } from "@/lib/locale";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${newsreader.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper font-sans text-ink antialiased">
        {/* Native skip link — Link href="/…" in the root layout can recurse the App Router. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/#anfrage"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-paper"
        >
          Zur Anfrage
        </a>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
