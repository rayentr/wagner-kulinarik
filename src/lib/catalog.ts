/**
 * Marketing catalog — mirrors brief §7–9.
 * Not live Supabase; admin catalog is editable — treat as illustrative.
 */

export const OCCASIONS = [
  {
    id: "wedding",
    title: "Hochzeit",
    description:
      "Celebrate the day with a tailored wedding package. — Der Tag mit Paket aus Location, Küche und Momenten.",
    text: "Zucker, Blüten, der erste Schnitt.",
    cta: "Hochzeit planen",
    type: "Hochzeit",
    image: "/images/wedding-desserts.jpg",
    alt: "Festlich gedeckter Hochzeitstisch",
  },
  {
    id: "birthday",
    title: "Geburtstag",
    text: "Kerzen, zu viel Kuchen, jemand lacht zu laut.",
    cta: "Geburtstag planen",
    type: "Geburtstag",
    image: "/images/celebration-cookies.jpg",
    alt: "Gedeckter Tisch für eine Geburtstagsfeier",
  },
  {
    id: "corporate",
    title: "Corporate",
    text: "Ein Tisch, der die Firma wie ein Haus wirken lässt.",
    cta: "Corporate planen",
    type: "Corporate",
    image: "/images/flavor-winter.jpg",
    alt: "Corporate Event mit warmem Tischlicht",
  },
  {
    id: "private-dinner",
    title: "Privates Dinner",
    text: "Nah. Wenig Besteck. Lange Pausen zwischen den Gängen.",
    cta: "Dinner planen",
    type: "Privates Dinner",
    image: "/images/gallery-table.jpg",
    alt: "Intim gedeckter Tisch für ein privates Dinner",
  },
  {
    id: "party",
    title: "Party",
    text: "Zu spät, zu laut, genau richtig.",
    cta: "Party planen",
    type: "Party",
    image: "/images/gallery-event.jpg",
    alt: "Festlich gestimmter Eventraum",
  },
  {
    id: "family",
    title: "Familientreffen",
    text: "Drei Generationen, ein Braten, kein Protokoll.",
    cta: "Familie planen",
    type: "Familientreffen",
    image: "/images/flavor-summer.jpg",
    alt: "Heller Tisch für ein Familientreffen",
  },
] as const;

/** Highlighted package services (§8.1–8.5, 8.8) for deep teaser. */
export const FEATURED_SERVICES = [
  {
    name: "Venue",
    category: "venue",
    selection: "single" as const,
    forWho: "Eine Location — single choice.",
    guests: "bis 300 Gäste",
    price: "ab Anfrage",
    line: "Halle, Garten, Rooftop, Restaurant oder Outdoor — die Location setzt den Rahmen und sperrt das Ort-Feld.",
    bullets: [
      "Event Hall · Garden · Rooftop Terrace",
      "Restaurant · Outdoor Venue",
      "Choices mit Max.-Gäste",
      "Selection mode: single",
    ],
    image: "/images/gallery-event.jpg",
    featured: true,
    tone: "night" as const,
  },
  {
    name: "Catering",
    category: "food",
    selection: "multiple" as const,
    forWho: "Food & Buffet — multiple.",
    guests: "Menü nach Anlass",
    price: "ab Anfrage",
    line: "Catering, Buffet, Finger Food oder Street Food — Choices mit Fotos im Paket-Build.",
    bullets: [
      "Catering · Buffet · Finger Food",
      "Street Food Stations",
      "Menü-Choices mit Fotos",
      "price_from, wo hinterlegt",
    ],
    image: "/images/hero-dessert-table.jpg",
    featured: false,
    tone: "paper" as const,
  },
  {
    name: "Live Cooking",
    category: "live-cooking",
    selection: "multiple" as const,
    forWho: "Chef vor Ort — Show & Geschmack.",
    guests: "Station oder Tisch",
    price: "ab Anfrage",
    line: "Live Cooking mit oder für Ihre Gäste — sichtbar und schmeckbar.",
    bullets: [
      "Chef live am Event",
      "Für oder mit Gästen",
      "Kombinierbar mit Catering",
      "Teil des Package Hub",
    ],
    image: "/images/flavor-signature.jpg",
    featured: false,
    tone: "cream" as const,
  },
  {
    name: "Drinks",
    category: "drinks",
    selection: "multiple" as const,
    forWho: "Bar & Getränke — multiple.",
    guests: "offen oder kuratiert",
    price: "ab Anfrage",
    line: "Bar Service, Cocktails, Mobile Bar, Kaffee und Soft Drinks.",
    bullets: [
      "Bar · Cocktails · Mobile Bar",
      "Coffee · Soft Drinks",
      "Open Bar oder Signature",
      "Mocktail-Optionen",
    ],
    image: "/images/gallery-table.jpg",
    featured: false,
    tone: "paper" as const,
  },
  {
    name: "Music",
    category: "music",
    selection: "multiple" as const,
    forWho: "Sound für den Abend.",
    guests: "DJ · Band · Stimme",
    price: "ab Anfrage",
    line: "DJ, Live Band, Singer oder Musician — Ceremony bis Party.",
    bullets: [
      "DJ · Live Band",
      "Singer · Musician",
      "Ceremony + Party Sets",
      "Weitere Kategorien unten",
    ],
    image: "/images/flavor-winter.jpg",
    featured: false,
    tone: "night" as const,
  },
] as const;

/** Full §8 category map — marketing summary only. */
export const SERVICE_CATEGORIES = [
  {
    key: "venue",
    title: "Venue & Location",
    mode: "single",
    items: "Event Hall · Garden · Rooftop · Restaurant · Outdoor",
  },
  {
    key: "food",
    title: "Food & Catering",
    mode: "multiple",
    items: "Catering · Buffet · Finger Food · Street Food",
  },
  {
    key: "live",
    title: "Live Cooking",
    mode: "multiple",
    items: "Chef live — mit oder für Gäste",
  },
  {
    key: "trucks",
    title: "Food Trucks & Stands",
    mode: "multiple",
    items: "Burger · Pizza · Crêpes · Eis · Kaffee · International",
  },
  {
    key: "drinks",
    title: "Drinks & Beverages",
    mode: "multiple",
    items: "Bar · Cocktails · Mobile Bar · Coffee · Soft Drinks",
  },
  {
    key: "weddings",
    title: "Weddings",
    mode: "multiple",
    items: "Planner · Bridal Decor · Cake · Officiant",
  },
  {
    key: "birthdays",
    title: "Birthdays & Parties",
    mode: "multiple",
    items: "Children · Adult · Themed",
  },
  {
    key: "music",
    title: "Music & Entertainment",
    mode: "multiple",
    items: "DJ · Live Band · Singer · Musician",
  },
  {
    key: "photo",
    title: "Photography & Video",
    mode: "multiple",
    items: "Photographer · Videographer · Photo Booth",
  },
  {
    key: "decor",
    title: "Decorations",
    mode: "multiple",
    items: "Flowers · Balloons · Table · Lighting",
  },
  {
    key: "tech",
    title: "Event Technology",
    mode: "multiple",
    items: "Lighting · Sound · Stage · Projector",
  },
  {
    key: "staff",
    title: "Staff & Personnel",
    mode: "multiple",
    items: "Waiters · Bartenders · Hostesses · Security",
  },
  {
    key: "kids",
    title: "Children & Animation",
    mode: "multiple",
    items: "Bouncy Castle · Clown · Magician · Face Painting",
  },
  {
    key: "rental",
    title: "Rental Services",
    mode: "multiple",
    items: "Tables · Chairs · Tents · Tableware · Refrigeration",
  },
  {
    key: "transport",
    title: "Transportation",
    mode: "multiple",
    items: "Wedding Car · Shuttle · Delivery",
  },
  {
    key: "other",
    title: "Other",
    mode: "multiple",
    items: "Custom / Specialized — tell us what you need",
  },
] as const;

/** §9 content types — teaser placeholders until Supabase. */
export const KITCHEN_ITEMS = [
  {
    kind: "Rezept",
    name: "Was wir anrühren",
    text: "Butter, Zeit, ein Gang, der nach der Nacht noch da ist.",
    image: "/images/flavor-summer.jpg",
    alt: "Gericht aus der Küche",
  },
  {
    kind: "Glas",
    name: "Speisekammer",
    text: "Ein Glas für zu Hause. Warenkorb in der App.",
    image: "/images/flavor-signature.jpg",
    alt: "Kulinarisches Produkt im Detail",
  },
  {
    kind: "Film",
    name: "Die Hände",
    text: "Kurze Clips — nicht das Rezeptbuch.",
    image: "/images/flavor-winter.jpg",
    alt: "Atmosphäre aus der Küche",
  },
  {
    kind: "Notiz",
    name: "Was das Haus erzählt",
    text: "Gelegentlich. Ohne Newsletter-Ton.",
    image: "/images/gallery-dessert.jpg",
    alt: "Editorial aus der Markenwelt",
  },
] as const;

/** Shop teaser — EUR, checkout in app (demo Stripe only). */
export const SHOP_PRODUCTS = [
  {
    name: "Haus-Konfitüre",
    category: "Speisekammer",
    price: "18 €",
    note: "Bestellen in der App",
    image: "/images/flavor-signature.jpg",
  },
  {
    name: "Saison-Set",
    category: "Mitnehmen",
    price: "42 €",
    note: "Bestellen in der App",
    image: "/images/flavor-summer.jpg",
  },
  {
    name: "Küche, klein",
    category: "Speisekammer",
    price: "28 €",
    note: "Bestellen in der App",
    image: "/images/gallery-dessert.jpg",
  },
] as const;

/** Warm 8×8 cream — LQIP for paper-room photographs. */
export const WARM_LQIP =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGN4//QaVsQwtCQApOaqgW97BscAAAAASUVORK5CYII=";

/** Honest status language (§10) — use sparingly. */
export const STATUSES = {
  events: "draft → requested → confirmed · live · completed · cancelled",
  reservations: "pending → confirmed · completed · cancelled",
  orders: "pending_payment → paid · cancelled · fulfilled",
} as const;

/** Explicitly not shipped — do not market as live. */
export const NOT_SHIPPED = [
  "Live Stripe / echte Kartenzahlung",
  "Attendee-Chat",
  "Community-Feed",
  "Gift Cards / Loyalty",
  "Shop-Produkte als Event-Paket-Position",
] as const;

export const INTENT_OPTIONS = [
  { id: "event", label: "Den Abend" },
  { id: "reservation", label: "Nur ein Tisch" },
] as const;
