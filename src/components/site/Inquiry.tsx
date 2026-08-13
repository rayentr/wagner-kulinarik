"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Flip,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from "@/lib/gsap";
import { AmbientVideo } from "./AmbientVideo";

const FIELD =
  "peer w-full border-b border-ivory/20 bg-transparent py-3 font-body text-ivory placeholder-transparent outline-none transition-colors focus:border-transparent";
const LABEL =
  "pointer-events-none absolute left-0 top-3 font-sans text-sm text-ivory/40 transition-all peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-brass peer-[&:not(:placeholder-shown)]:-top-3.5 peer-[&:not(:placeholder-shown)]:text-xs";

const EVENT_TYPES = ["Hochzeit", "Geburtstag", "Event", "Andere"] as const;
const GUEST_BANDS = ["bis 40", "40–80", "80–120", "120+"] as const;
const VIBES = [
  { id: "ruhig", label: "Ruhig" },
  { id: "festlich", label: "Festlich" },
  { id: "bold", label: "Bold" },
] as const;

function recommendBudget(guests: string, vibe: string) {
  if (guests === "120+" || vibe === "bold") return "Couture";
  if (guests === "bis 40" && vibe === "ruhig") return "Atelier";
  return "Signature";
}

export function Inquiry() {
  const root = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGLineElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [guests, setGuests] = useState("");
  const [vibe, setVibe] = useState("");
  const [step, setStep] = useState(0);

  const recommendation = useMemo(() => {
    if (!guests || !vibe) return null;
    return recommendBudget(guests, vibe);
  }, [guests, vibe]);

  const goStep = (next: number) => {
    if (!prefersReducedMotion() && panelRef.current) {
      flipState.current = Flip.getState(panelRef.current);
    }
    setStep(next);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-prefill-type],[data-prefill-budget]",
      );
      if (!el) return;
      const t = el.getAttribute("data-prefill-type");
      const b = el.getAttribute("data-prefill-budget");
      if (t) {
        setType(t);
        goStep(3);
      }
      if (b) {
        setBudget(b);
        goStep(3);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!flipState.current || prefersReducedMotion() || !panelRef.current)
      return;
    Flip.from(flipState.current, {
      duration: 0.55,
      ease: "lc.soft",
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, ease: "lc.soft" },
        ),
      onLeave: (els) =>
        gsap.to(els, { opacity: 0, duration: 0.25, ease: "power2.in" }),
    });
    flipState.current = null;
  }, [step]);

  useLayoutEffect(() => {
    const line = progressRef.current;
    if (!line || prefersReducedMotion()) {
      if (line) gsap.set(line, { drawSVG: `${Math.min(step, 3) * (100 / 3)}%` });
      return;
    }
    const pct = Math.min(step, 3) * (100 / 3);
    gsap.to(line, {
      drawSVG: `${pct}%`,
      duration: 0.55,
      ease: "lc.soft",
    });
  }, [step]);

  useGSAP(
    () => {
      if (step < 3) return;
      if (prefersReducedMotion()) return;
      const form = root.current?.querySelector("[data-form]");
      const fields = root.current?.querySelectorAll("[data-field]");
      if (!form || !fields?.length) return;
      gsap.from(fields, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "lc.soft",
        scrollTrigger: { trigger: form, start: "top 78%", once: true },
      });
    },
    { scope: root, dependencies: [step] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const line = progressRef.current;
      if (line) gsap.set(line, { drawSVG: "0%" });
    },
    { scope: root },
  );

  const burst = (origin: HTMLElement) => {
    if (prefersReducedMotion()) return;
    const rect = origin.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const crumb = document.createElement("span");
      crumb.style.cssText = `position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;width:${4 + Math.random() * 4}px;height:${4 + Math.random() * 4}px;border-radius:2px;background:var(--brass);z-index:60;pointer-events:none;`;
      document.body.appendChild(crumb);
      gsap.to(crumb, {
        x: (Math.random() - 0.5) * 180,
        y: (Math.random() - 0.5) * 140 - 40,
        rotation: Math.random() * 180,
        opacity: 0,
        duration: 0.45 + Math.random() * 0.2,
        ease: "power2.out",
        onComplete: () => crumb.remove(),
      });
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const btn = (e.currentTarget.querySelector(
      "[data-submit]",
    ) as HTMLElement) ?? null;
    if (btn) burst(btn);
    setSent(true);
  };

  return (
    <section
      id="anfrage"
      ref={root}
      className="bg-night px-6 py-24 md:px-12 md:py-36"
    >
      <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="flex flex-col">
          <p className="label mb-5 text-brass">08 / Anfrage</p>
          <h2 className="max-w-[9ch] font-display text-5xl font-medium leading-[.92] tracking-[-.04em] text-ivory md:text-7xl">
            Verfügbarkeit prüfen.
          </h2>
          <p className="mt-6 max-w-[38ch] font-body text-lg leading-relaxed text-ivory/70">
            So beginnt jede Anfrage: ein kurzes Gespräch über Ihren Moment —
            Antwort innerhalb von 48 Stunden.
          </p>

          <div
            className="relative mt-10 aspect-[4/5] overflow-hidden md:aspect-[5/4] lg:flex-1 lg:min-h-[22rem]"
            data-cursor="media"
          >
            <AmbientVideo
              src="/video/dessert-detail.mp4"
              poster="/images/flavor-signature.jpg"
              position="center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-body text-sm text-ivory/80">
              „So beginnt jede Anfrage.“
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex min-h-[300px] flex-col items-start justify-center">
            <p className="label text-brass">Danke</p>
            <h3 className="mt-4 font-display text-3xl font-medium text-ivory md:text-4xl">
              Ihre Anfrage ist unterwegs.
            </h3>
            <p className="mt-4 max-w-[42ch] font-body text-lg text-ivory/70">
              Wir melden uns innerhalb von 48 Stunden. Bis dahin: lassen Sie den
              Moment auf sich wirken.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-10 border border-ivory/10 bg-night-soft/40 p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <p className="label text-brass">Zuerst drei Fragen</p>
                <svg
                  viewBox="0 0 120 8"
                  className="h-2 w-28 overflow-visible"
                  aria-hidden
                >
                  <line
                    x1="2"
                    y1="4"
                    x2="118"
                    y2="4"
                    stroke="rgba(252,250,248,0.12)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    ref={progressRef}
                    x1="2"
                    y1="4"
                    x2="118"
                    y2="4"
                    stroke="var(--brass)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div ref={panelRef} className="relative mt-6 min-h-[9rem]">
                {step === 0 && (
                  <div data-inquiry-step>
                    <p className="font-display text-2xl text-ivory">
                      Welcher Anlass?
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {EVENT_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          data-cursor="link"
                          onClick={() => {
                            setType(t);
                            goStep(1);
                          }}
                          className={`border px-4 py-2.5 font-sans text-sm transition-colors ${
                            type === t
                              ? "border-accent bg-accent text-paper"
                              : "border-ivory/25 text-ivory/80 hover:border-brass"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div data-inquiry-step>
                    <p className="font-display text-2xl text-ivory">
                      Wie viele Gäste?
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {GUEST_BANDS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          data-cursor="link"
                          onClick={() => {
                            setGuests(g);
                            goStep(2);
                          }}
                          className={`border px-4 py-2.5 font-sans text-sm transition-colors ${
                            guests === g
                              ? "border-accent bg-accent text-paper"
                              : "border-ivory/25 text-ivory/80 hover:border-brass"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      data-cursor="link"
                      onClick={() => goStep(0)}
                      className="mt-5 font-sans text-xs text-ivory/40"
                    >
                      ← Zurück
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div data-inquiry-step>
                    <p className="font-display text-2xl text-ivory">
                      Welche Stimmung?
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {VIBES.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          data-cursor="link"
                          onClick={() => {
                            setVibe(v.id);
                            setBudget(recommendBudget(guests, v.id));
                            goStep(3);
                          }}
                          className={`border px-4 py-2.5 font-sans text-sm transition-colors ${
                            vibe === v.id
                              ? "border-accent bg-accent text-paper"
                              : "border-ivory/25 text-ivory/80 hover:border-brass"
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      data-cursor="link"
                      onClick={() => goStep(1)}
                      className="mt-5 font-sans text-xs text-ivory/40"
                    >
                      ← Zurück
                    </button>
                  </div>
                )}

                {step >= 3 && recommendation && (
                  <div data-inquiry-step>
                    <p className="font-sans text-sm text-ivory/55">
                      Wir empfehlen
                    </p>
                    <p className="mt-1 font-display text-4xl text-brass">
                      {recommendation}
                    </p>
                    <p className="mt-3 max-w-[40ch] font-body text-sm text-ivory/65">
                      {type} · {guests} Gäste · {vibe}. Passen Sie das Budget
                      unten jederzeit an.
                    </p>
                    <button
                      type="button"
                      data-cursor="link"
                      onClick={() => goStep(0)}
                      className="mt-4 font-sans text-xs text-ivory/40 underline underline-offset-2"
                    >
                      Fragen neu beantworten
                    </button>
                  </div>
                )}
              </div>

              {step < 3 && (
                <p className="mt-8 font-sans text-xs text-ivory/35">
                  Schritt {Math.min(step + 1, 3)} / 3 — dann das Formular
                </p>
              )}
            </div>

            {(step >= 3 || budget) && (
              <form
                data-form
                data-cursor="hide"
                onSubmit={onSubmit}
                className="flex flex-col gap-8"
              >
                <div className="grid gap-8 sm:grid-cols-2">
                  <div data-field className="relative">
                    <input
                      id="name"
                      required
                      placeholder="Name"
                      className={FIELD}
                    />
                    <label htmlFor="name" className={LABEL}>
                      Name *
                    </label>
                    <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-300 peer-focus:scale-x-100" />
                  </div>
                  <div data-field className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="E-Mail"
                      className={FIELD}
                    />
                    <label htmlFor="email" className={LABEL}>
                      E-Mail *
                    </label>
                    <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-300 peer-focus:scale-x-100" />
                  </div>
                  <div data-field className="relative">
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Telefon"
                      className={FIELD}
                    />
                    <label htmlFor="phone" className={LABEL}>
                      Telefon
                    </label>
                    <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-300 peer-focus:scale-x-100" />
                  </div>
                  <div data-field className="relative">
                    <select
                      id="type"
                      required
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className={`${FIELD} appearance-none`}
                    >
                      <option value="" disabled className="bg-cocoa">
                        Event-Typ *
                      </option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} className="bg-cocoa">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div data-field className="relative">
                    <input
                      id="date"
                      type="date"
                      required
                      className={`${FIELD} text-ivory/80 [color-scheme:dark]`}
                    />
                    <label
                      htmlFor="date"
                      className="pointer-events-none absolute -top-3.5 left-0 font-sans text-xs text-brass"
                    >
                      Datum *
                    </label>
                  </div>
                  <div data-field className="relative">
                    <input
                      id="ort"
                      required
                      placeholder="Ort / PLZ"
                      className={FIELD}
                    />
                    <label htmlFor="ort" className={LABEL}>
                      Ort / PLZ *
                    </label>
                    <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-300 peer-focus:scale-x-100" />
                  </div>
                  <div data-field className="relative">
                    <select
                      id="guests"
                      required
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className={`${FIELD} appearance-none`}
                    >
                      <option value="" disabled className="bg-cocoa">
                        Gästezahl *
                      </option>
                      {GUEST_BANDS.map((g) => (
                        <option key={g} className="bg-cocoa">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div data-field className="relative">
                    <select
                      id="budget"
                      required
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className={`${FIELD} appearance-none`}
                    >
                      <option value="" disabled className="bg-cocoa">
                        Budget-Rahmen *
                      </option>
                      <option className="bg-cocoa">Noch offen</option>
                      <option className="bg-cocoa">Atelier</option>
                      <option className="bg-cocoa">Signature</option>
                      <option className="bg-cocoa">Couture</option>
                    </select>
                  </div>
                </div>

                <div data-field className="relative">
                  <textarea
                    id="msg"
                    rows={3}
                    placeholder="Nachricht"
                    className={`${FIELD} resize-none`}
                  />
                  <label htmlFor="msg" className={LABEL}>
                    Nachricht
                  </label>
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-300 peer-focus:scale-x-100" />
                </div>

                <label
                  data-field
                  className="flex items-start gap-3 font-sans text-sm text-ivory/60"
                >
                  <input
                    type="checkbox"
                    required
                    className="mt-1 accent-[var(--brass)]"
                  />
                  <span>
                    Ich habe die{" "}
                    <a
                      href="#datenschutz"
                      className="text-brass underline underline-offset-2"
                    >
                      Datenschutzerklärung
                    </a>{" "}
                    gelesen und stimme zu. *
                  </span>
                </label>

                <button
                  data-field
                  data-submit
                  data-cursor="cta"
                  type="submit"
                  className="self-start bg-accent px-8 py-3.5 font-sans text-sm font-medium text-paper transition-colors duration-300 hover:bg-[#ca5138]"
                >
                  Anfrage senden
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
