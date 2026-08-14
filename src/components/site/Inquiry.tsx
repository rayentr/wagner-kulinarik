"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Observer } from "gsap/Observer";
import {
  gsap,
  isCoarsePointer,
  prefersReducedMotion,
  useGSAP,
} from "@/lib/gsap";
import { getLenis } from "@/lib/lenis-ref";
import { INTENT_OPTIONS, OCCASIONS } from "@/lib/catalog";
import { AmbientVideo } from "./AmbientVideo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

const FIELD =
  "peer w-full border-b border-ink/20 bg-transparent py-3 font-sans text-ink placeholder-transparent outline-none transition-colors focus:border-transparent";
const LABEL =
  "pointer-events-none absolute left-0 top-3 font-sans text-sm text-ink/40 transition-all peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-ink peer-[&:not(:placeholder-shown)]:-top-3.5 peer-[&:not(:placeholder-shown)]:text-xs";

const EVENT_TYPES = OCCASIONS.map((o) => o.type);
const GUEST_BANDS = ["bis 40", "40–80", "80–120", "120+"] as const;
const PROGRESS_LEN = 116;

function progressOffset(step: number) {
  return PROGRESS_LEN * (1 - Math.min(step, 3) / 3);
}

function subscribeCoarse(onChange: () => void) {
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function asksForCard(href: string) {
  return href === "#anfrage" || href === "/#anfrage" || href.endsWith("#anfrage");
}

/**
 * Place card on the table — three questions, then the form. 48h is care.
 * Coarse: a sheet you pull up. Fine: the card is dealt onto the film.
 */
export function Inquiry() {
  const root = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLButtonElement>(null);
  const gripRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGLineElement>(null);
  const gripDragged = useRef(false);
  const sheetReady = useRef(false);
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("");
  const [intent, setIntent] = useState("");
  const [guests, setGuests] = useState("");
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState(false);
  const coarse = useSyncExternalStore(
    subscribeCoarse,
    isCoarsePointer,
    () => false,
  );

  const goStep = (next: number) => {
    setStep(next);
  };

  const openSheet = () => {
    if (isCoarsePointer()) setSheet(true);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-prefill-type]",
      );
      if (el) {
        const t = el.getAttribute("data-prefill-type");
        if (t) {
          setType(t);
          setIntent("event");
          goStep(3);
        }
        openSheet();
        return;
      }
      const link = (e.target as HTMLElement)?.closest("a");
      if (!link) return;
      if (asksForCard(link.getAttribute("href") ?? "")) openSheet();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const fromHash = () => {
      if (location.hash === "#anfrage") openSheet();
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheet(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card || prefersReducedMotion() || isCoarsePointer()) return;
      gsap.fromTo(
        card,
        { yPercent: 28, rotate: -7 },
        {
          yPercent: 0,
          rotate: -1.4,
          duration: 1.15,
          ease: "lc.luxury",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          },
        },
      );
    },
    { scope: root, dependencies: [coarse], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      const card = cardRef.current;
      const veil = veilRef.current;
      if (!card) return;

      if (!coarse) {
        sheetReady.current = false;
        gsap.set(card, { yPercent: 0 });
        if (veil) gsap.set(veil, { autoAlpha: 0 });
        getLenis()?.start();
        return;
      }

      if (!sheetReady.current) {
        gsap.set(card, { yPercent: sheet ? 0 : 100 });
        if (veil) gsap.set(veil, { autoAlpha: sheet ? 1 : 0 });
        sheetReady.current = true;
        if (sheet) getLenis()?.stop();
        else getLenis()?.start();
        return;
      }

      const reduce = prefersReducedMotion();
      gsap.to(card, {
        yPercent: sheet ? 0 : 100,
        duration: reduce ? 0 : 0.7,
        ease: "lc.luxury",
        overwrite: "auto",
      });
      if (veil) {
        gsap.to(veil, {
          autoAlpha: sheet ? 1 : 0,
          duration: reduce ? 0 : 0.45,
          ease: "lc.soft",
          overwrite: "auto",
        });
      }
      if (sheet) getLenis()?.stop();
      else getLenis()?.start();

      return () => {
        getLenis()?.start();
      };
    },
    { dependencies: [sheet, coarse] },
  );

  useGSAP(
    () => {
      const card = cardRef.current;
      const veil = veilRef.current;
      const peek = peekRef.current;
      const grip = gripRef.current;
      if (!coarse || !card) return;

      const apply = (yPercent: number) => {
        const y = gsap.utils.clamp(0, 100, yPercent);
        gsap.set(card, { yPercent: y });
        if (veil) gsap.set(veil, { autoAlpha: 1 - y / 100 });
        return y;
      };

      const snap = (open: boolean) => {
        setSheet(open);
        const reduce = prefersReducedMotion();
        gsap.to(card, {
          yPercent: open ? 0 : 100,
          duration: reduce ? 0 : 0.55,
          ease: "lc.luxury",
          overwrite: "auto",
        });
        if (veil) {
          gsap.to(veil, {
            autoAlpha: open ? 1 : 0,
            duration: reduce ? 0 : 0.4,
            ease: "lc.soft",
            overwrite: "auto",
          });
        }
        if (open) getLenis()?.stop();
        else getLenis()?.start();
      };

      const observers: Observer[] = [];

      if (peek) {
        observers.push(
          Observer.create({
            target: peek,
            type: "touch,pointer",
            tolerance: 8,
            preventDefault: false,
            onChangeY(self) {
              if (self.deltaY < -12) setSheet(true);
            },
          }),
        );
      }

      if (grip) {
        observers.push(
          Observer.create({
            target: grip,
            type: "touch,pointer",
            tolerance: 4,
            preventDefault: true,
            onPress() {
              gripDragged.current = false;
            },
            onChangeY(self) {
              if (Math.abs(self.deltaY) < 2) return;
              gripDragged.current = true;
              const h = Math.max(card.offsetHeight, 1);
              const current = Number(gsap.getProperty(card, "yPercent")) || 0;
              apply(current + (self.deltaY / h) * 100);
            },
            onRelease() {
              if (!gripDragged.current) return;
              const y = Number(gsap.getProperty(card, "yPercent")) || 0;
              snap(y < 40);
            },
          }),
        );
      }

      return () => {
        observers.forEach((o) => o.kill());
      };
    },
    { dependencies: [coarse] },
  );

  useLayoutEffect(() => {
    const inner = panelRef.current?.querySelector("[data-inquiry-step]");
    if (!inner || prefersReducedMotion()) return;
    gsap.fromTo(
      inner,
      { yPercent: 20 },
      { yPercent: 0, duration: 0.55, ease: "lc.soft" },
    );
  }, [step]);

  useLayoutEffect(() => {
    const line = progressRef.current;
    if (!line) return;
    const offset = progressOffset(step);
    gsap.set(line, { strokeDasharray: PROGRESS_LEN });
    if (prefersReducedMotion()) {
      gsap.set(line, { strokeDashoffset: offset });
      return;
    }
    gsap.to(line, {
      strokeDashoffset: offset,
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
      const tween = {
        y: 20,
        duration: 0.65,
        stagger: 0.05,
        ease: "lc.soft",
      };
      if (isCoarsePointer()) {
        gsap.from(fields, tween);
        return;
      }
      gsap.from(fields, {
        ...tween,
        scrollTrigger: { trigger: form, start: "top 82%", once: true },
      });
    },
    { scope: root, dependencies: [step] },
  );

  useGSAP(
    () => {
      const line = progressRef.current;
      if (line) {
        gsap.set(line, {
          strokeDasharray: PROGRESS_LEN,
          strokeDashoffset: PROGRESS_LEN,
        });
      }
    },
    { scope: root },
  );

  const burst = (origin: HTMLElement) => {
    if (prefersReducedMotion()) return;
    const rect = origin.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const crumb = document.createElement("span");
      crumb.style.cssText = `position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;width:${5 + Math.random() * 5}px;height:${5 + Math.random() * 5}px;border-radius:2px;background:var(--accent);z-index:70;pointer-events:none;`;
      document.body.appendChild(crumb);
      gsap.to(crumb, {
        x: (Math.random() - 0.5) * 180,
        y: (Math.random() - 0.5) * 140 - 40,
        rotation: Math.random() * 180,
        scale: 0,
        duration: 0.5 + Math.random() * 0.2,
        ease: "lc.soft",
        onComplete: () => crumb.remove(),
      });
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const btn =
      (e.currentTarget.querySelector("[data-submit]") as HTMLElement) ?? null;
    if (btn) burst(btn);
    setSent(true);
  };

  const intentLabel =
    INTENT_OPTIONS.find((o) => o.id === intent)?.label ?? intent;

  const formReady = step >= 3 || Boolean(type && intent && guests);

  const chip = (on: boolean) =>
    `min-h-11 border px-4 py-2.5 font-sans text-sm transition-colors ${
      on
        ? "border-accent bg-accent text-paper"
        : "border-ink/20 text-ink/70 hover:border-ink"
    }`;

  const card = (
    <>
      {sent ? (
        <div>
          <p className="label text-ink/45">Danke</p>
          <h2 className="mt-4 font-display text-3xl font-medium md:text-4xl">
            Ihre Karte ist unterwegs.
          </h2>
          <p className="mt-4 max-w-[36ch] font-sans text-base leading-relaxed text-ink/60">
            {intent === "reservation"
              ? "Wir prüfen den Tisch und melden uns."
              : "Wir klären den Abend mit Ihnen."}
          </p>
          <p className="mt-6 font-display text-sm italic text-ink/45">
            Innerhalb von 48 Stunden — das ist Sorgfalt.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="label text-ink/45">Platzkarte</p>
            <svg
              viewBox="0 0 120 8"
              className="h-2 w-24 overflow-visible"
              aria-hidden
            >
              <line
                x1="2"
                y1="4"
                x2="118"
                y2="4"
                stroke="rgba(35,31,32,0.12)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                ref={progressRef}
                x1="2"
                y1="4"
                x2="118"
                y2="4"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2
            id="inquiry-title"
            className="mt-4 font-display text-4xl font-medium leading-[.92] tracking-[-.03em] md:text-5xl"
          >
            Ihr Abend.
          </h2>

          <div
            ref={panelRef}
            className="relative mt-8 min-h-[8.5rem] overflow-hidden"
          >
            {step === 0 && (
              <div data-inquiry-step>
                <p className="font-display text-xl text-ink">Welcher Anlass?</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      data-cursor="link"
                      onClick={() => {
                        setType(t);
                        goStep(1);
                      }}
                      className={chip(type === t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div data-inquiry-step>
                <p className="font-display text-xl text-ink">Wie viele Gäste?</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {GUEST_BANDS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      data-cursor="link"
                      onClick={() => {
                        setGuests(g);
                        goStep(2);
                      }}
                      className={chip(guests === g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  data-cursor="link"
                  onClick={() => goStep(0)}
                  className="mt-5 min-h-11 font-sans text-xs text-ink/40"
                >
                  ← Zurück
                </button>
              </div>
            )}

            {step === 2 && (
              <div data-inquiry-step>
                <p className="font-display text-xl text-ink">
                  Was brauchen Sie?
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {INTENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      data-cursor="link"
                      onClick={() => {
                        setIntent(opt.id);
                        goStep(3);
                      }}
                      className={chip(intent === opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  data-cursor="link"
                  onClick={() => goStep(1)}
                  className="mt-5 min-h-11 font-sans text-xs text-ink/40"
                >
                  ← Zurück
                </button>
              </div>
            )}

            {step >= 3 && type && intent && (
              <div data-inquiry-step>
                <p className="font-display text-2xl text-ink">{intentLabel}</p>
                <p className="mt-2 font-sans text-sm text-ink/55">
                  {type} · {guests}
                </p>
                <button
                  type="button"
                  data-cursor="link"
                  onClick={() => goStep(0)}
                  className="mt-4 min-h-11 font-sans text-xs text-ink/40"
                >
                  Neu legen
                </button>
              </div>
            )}
          </div>

          {formReady && (
            <form
              data-form
              data-cursor="hide"
              onSubmit={onSubmit}
              className="mt-8 flex flex-col gap-7 border-t border-ink/10 pt-8"
            >
              <input type="hidden" name="intent" value={intent} />
              <div className="grid gap-7 sm:grid-cols-2">
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
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 peer-focus:scale-x-100" />
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
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 peer-focus:scale-x-100" />
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
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 peer-focus:scale-x-100" />
                </div>
                <div data-field className="relative">
                  <select
                    id="type"
                    required
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`${FIELD} appearance-none`}
                  >
                    <option value="" disabled className="bg-paper">
                      Anlass *
                    </option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} className="bg-paper">
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
                    className={`${FIELD} text-ink/80 [color-scheme:light]`}
                  />
                  <label
                    htmlFor="date"
                    className="pointer-events-none absolute -top-3.5 left-0 font-sans text-xs text-ink/50"
                  >
                    Datum *
                  </label>
                </div>
                {intent === "reservation" && (
                  <div data-field className="relative">
                    <input
                      id="time"
                      type="time"
                      required
                      className={`${FIELD} text-ink/80 [color-scheme:light]`}
                    />
                    <label
                      htmlFor="time"
                      className="pointer-events-none absolute -top-3.5 left-0 font-sans text-xs text-ink/50"
                    >
                      Uhrzeit *
                    </label>
                  </div>
                )}
                <div data-field className="relative">
                  <input
                    id="ort"
                    required={intent === "event"}
                    placeholder="Ort / PLZ"
                    className={FIELD}
                  />
                  <label htmlFor="ort" className={LABEL}>
                    Ort / PLZ{intent === "event" ? " *" : ""}
                  </label>
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 peer-focus:scale-x-100" />
                </div>
                <div data-field className="relative">
                  <select
                    id="guests"
                    required
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className={`${FIELD} appearance-none`}
                  >
                    <option value="" disabled className="bg-paper">
                      Gästezahl *
                    </option>
                    {GUEST_BANDS.map((g) => (
                      <option key={g} className="bg-paper">
                        {g}
                      </option>
                    ))}
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
                <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 peer-focus:scale-x-100" />
              </div>

              <label
                data-field
                className="flex items-start gap-3 font-sans text-sm text-ink/60"
              >
                <input
                  type="checkbox"
                  required
                  className="mt-1 accent-[var(--accent)]"
                />
                <span>
                  Ich habe die{" "}
                  <a
                    href="#datenschutz"
                    className="text-ink underline underline-offset-2"
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
                className="inline-flex min-h-11 items-center self-start bg-accent px-8 py-3.5 font-sans text-sm font-medium text-paper transition-colors duration-300 hover:bg-berry-bright"
              >
                {intent === "reservation"
                  ? "Den Tisch halten"
                  : "Die Karte schicken"}
              </button>
              <p className="font-display text-sm italic text-ink/40">
                Innerhalb von 48 Stunden — das ist Sorgfalt.
              </p>
            </form>
          )}
        </>
      )}
    </>
  );

  return (
    <section id="anfrage" ref={root} className="bg-paper text-ink">
      <div
        className="relative aspect-[16/9] max-h-[42dvh] min-h-[14rem] overflow-hidden bg-night-soft"
        data-cursor="media"
      >
        <AmbientVideo
          src="/video/dessert-detail.mp4"
          poster="/images/inquiry-table.jpg"
          position="center"
          lazy
          preload="none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/20 to-transparent" />
      </div>

      {coarse && (
        <div className="relative z-10 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
          <button
            ref={peekRef}
            type="button"
            data-sheet-peek
            onClick={() => setSheet(true)}
            className="surface-cream w-full px-6 py-5 text-left shadow-[0_18px_40px_rgba(35,31,32,.06)]"
          >
            <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-ink/15" />
            <span className="label text-ink/45">Platzkarte</span>
            <span className="mt-1 block font-display text-2xl font-medium tracking-[-.02em] text-ink">
              Die Karte ziehen
            </span>
          </button>
        </div>
      )}

      {coarse && (
        <div
          ref={veilRef}
          className="fixed inset-0 z-[55] bg-night/45"
          style={{ visibility: "hidden" }}
          onClick={() => setSheet(false)}
          aria-hidden
        />
      )}

      <div
        className={
          coarse
            ? ""
            : "relative z-10 mx-auto -mt-24 max-w-[34rem] px-6 pb-20 md:-mt-32 md:px-0 md:pb-28"
        }
      >
        <div
          ref={cardRef}
          role={coarse ? "dialog" : undefined}
          aria-modal={coarse ? sheet : undefined}
          aria-labelledby={coarse ? "inquiry-title" : undefined}
          aria-hidden={coarse ? !sheet : undefined}
          data-inquiry-sheet={coarse ? "" : undefined}
          className={
            coarse
              ? "surface-cream fixed inset-x-0 bottom-0 z-[60] max-h-[min(92dvh,42rem)] overflow-y-auto px-7 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[0_-18px_50px_rgba(35,31,32,.12)] will-change-transform md:px-10"
              : "surface-cream origin-center px-7 py-8 shadow-[0_24px_50px_rgba(35,31,32,.08)] md:px-10 md:py-11"
          }
        >
          {coarse && (
            <button
              ref={gripRef}
              type="button"
              data-sheet-grip
              aria-label="Karte legen"
              onClick={() => {
                if (gripDragged.current) return;
                setSheet(false);
              }}
              className="mx-auto mb-2 flex min-h-11 w-full touch-none items-start justify-center"
            >
              <span className="mt-2 block h-1 w-10 rounded-full bg-ink/20" />
            </button>
          )}
          {card}
        </div>
      </div>
    </section>
  );
}
