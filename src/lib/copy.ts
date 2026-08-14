/**
 * Site copy — DE is the house, EN is a guest at the door.
 */
export type Locale = "de" | "en";

export const copy = {
  de: {
    meta: {
      title: "Wagner Kulinarik — Momente, die man schmecken kann",
      description:
        "Wagner Kulinarik. Ein Haus in Berlin — wir decken den Abend, Sie laden ein. Live-Cooking, der Tisch, die Nacht.",
    },
    hero: {
      eyebrow: "Berlin",
      headline: "Momente, die man schmecken kann",
      support: "Wir decken. Sie laden ein. Die Nacht bleibt.",
      ctaPlan: "Den Abend anfragen",
      ctaReserve: "Nur ein Tisch",
      ctaApp: "Die Nacht in der Hand",
      words: ["DECKEN", "EINLADEN", "TEILEN"] as const,
      side: "Ein Haus · Ein Abend",
    },
    nav: {
      occasions: "Anlässe",
      process: "Ablauf",
      services: "Leistungen",
      night: "Nacht",
      discover: "Küche",
      app: "App",
      reserve: "Anfrage",
      menu: "Menü",
      close: "Schließen",
      home: "Wagner Kulinarik — Start",
    },
    manifesto: {
      eyebrow: "Das Haus",
      headline: "Sie kommen als Gast. Sie gehen mit einer Nacht.",
      body: "Kein Katalog. Ein Tisch, an dem geplant wird — und ein Abend, den man noch schmeckt, wenn die Lichter aus sind.",
      aside: "Berlin & Umland",
    },
    app: {
      label: "Zum Mitnehmen",
      title: "Die Nacht in der Hand",
      body: "Wenn der Abend vorbei ist, bleibt er in der Tasche. Jetzt auf den Bildschirm. Stores folgen.",
      inviteTitle: "Gäste finden den Weg",
      inviteBody:
        "Ein Link, ein Code — und sie sind am Tisch: Ort, Zeit, die Bilder der Nacht.",
      storeIos: "App Store — bald",
      storeAndroid: "Google Play — bald",
      schemeNote: "Einladungen bleiben",
      install: "Auf den Bildschirm",
      installIos: "Teilen — dann „Zum Home-Bildschirm“.",
      installHint: "Im Menü des Browsers: App installieren.",
      installDone: "Schon in der Hand.",
      share: "Teilen",
      shared: "Unterwegs.",
      copied: "Link gelegt.",
    },
    chapter: {
      start: "Tür",
      night: "Nacht",
      discover: "Küche",
      aria: "Abend",
    },
    footer: {
      contactLabel: "Haus",
      email: "hello@wagnerkulinarik.com",
      phone: "+49 · auf Anfrage",
      location: "Berlin & Umland",
      language: "Für Gäste",
      legal: "Rechtliches",
      impressum: "Impressum",
      privacy: "Datenschutz",
      terms: "AGB",
      app: "Danach",
      appIos: "App Store — bald",
      appAndroid: "Google Play — bald",
      rights: "Alle Rechte vorbehalten.",
    },
  },
  en: {
    meta: {
      title: "Wagner Kulinarik — Host moments worth tasting",
      description:
        "Wagner Kulinarik. A house in Berlin — we set the table, you invite. Live cooking, the night, the aftertaste.",
    },
    hero: {
      eyebrow: "Berlin",
      headline: "Host moments worth tasting",
      support: "We set the table. You invite. The night stays.",
      ctaPlan: "Ask for the evening",
      ctaReserve: "Just a table",
      ctaApp: "The night in your hand",
      words: ["SET", "INVITE", "SHARE"] as const,
      side: "A house · A night",
    },
    nav: {
      occasions: "Occasions",
      process: "The evening",
      services: "Services",
      night: "Night",
      discover: "Kitchen",
      app: "App",
      reserve: "Enquire",
      menu: "Menu",
      close: "Close",
      home: "Wagner Kulinarik — Home",
    },
    manifesto: {
      eyebrow: "The house",
      headline: "You arrive as a guest. You leave with a night.",
      body: "Not a catalogue. A table where the evening is planned — and a taste that lasts after the lights go out.",
      aside: "Berlin & surrounds",
    },
    app: {
      label: "To take with you",
      title: "The night in your hand",
      body: "When the evening ends, it stays in your pocket. Home Screen now. Stores soon.",
      inviteTitle: "Guests find the table",
      inviteBody:
        "A link, a code — and they are there: place, time, the pictures of the night.",
      storeIos: "App Store — soon",
      storeAndroid: "Google Play — soon",
      schemeNote: "Invites remain",
      install: "Add to Home Screen",
      installIos: "Share — then “Add to Home Screen”.",
      installHint: "In the browser menu: Install app.",
      installDone: "Already in your hand.",
      share: "Share",
      shared: "On its way.",
      copied: "Link copied.",
    },
    chapter: {
      start: "Door",
      night: "Night",
      discover: "Kitchen",
      aria: "Evening",
    },
    footer: {
      contactLabel: "House",
      email: "hello@wagnerkulinarik.com",
      phone: "+49 · on request",
      location: "Berlin & surrounds",
      language: "For guests",
      legal: "Legal",
      impressum: "Imprint",
      privacy: "Privacy",
      terms: "Terms",
      app: "After",
      appIos: "App Store — soon",
      appAndroid: "Google Play — soon",
      rights: "All rights reserved.",
    },
  },
} as const;

export type Copy = (typeof copy)[Locale];

/** Server-default locale (metadata, SSR). Client toggle via LocaleProvider. */
export const defaultLocale: Locale = "de";
export const t = copy[defaultLocale];
