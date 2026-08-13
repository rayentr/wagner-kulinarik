import type { Metadata } from "next";
import { Fraunces, Literata, Oswald } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wagner Kulinarik — Momente, die man schmecken kann",
  description:
    "Wagner Kulinarik. Edles Catering für Hochzeiten, Events und Feiern. Choreografiert von der ersten Anfrage bis zum letzten Gang am Tisch.",
  openGraph: {
    title: "Wagner Kulinarik — Momente, die man schmecken kann",
    description:
      "Catering für Hochzeiten, Events und Feiern — Berlin & Umland.",
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
      className={`${fraunces.variable} ${literata.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
