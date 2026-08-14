"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/locale";
import { isAppleTouch, isStandalone } from "@/lib/share";

type BeforeInstall = Event & { prompt: () => Promise<void> };

/**
 * An object on the way out — device + invite note.
 * Home Screen now. Stores honest. No QR theater.
 */
export function AppInvite() {
  const t = useT();
  const deferred = useRef<BeforeInstall | null>(null);
  const [mode, setMode] = useState<"done" | "prompt" | "ios" | "hint">("hint");

  useEffect(() => {
    if (isStandalone()) {
      setMode("done");
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstall;
      setMode("prompt");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isAppleTouch()) setMode("ios");

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    const ev = deferred.current;
    if (!ev) return;
    await ev.prompt();
    deferred.current = null;
    if (isStandalone()) setMode("done");
    else setMode("hint");
  };

  return (
    <section
      id="app"
      aria-label={t.app.label}
      className="border-t border-border bg-paper px-6 py-10 text-ink md:px-12 md:py-12"
    >
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-end gap-10 md:gap-16">
        <div
          className="relative w-[11.5rem] shrink-0 rotate-[-7deg]"
          aria-hidden
        >
          <div className="border border-ink/15 bg-night p-2.5 shadow-[0_20px_40px_rgba(35,31,32,.18)]">
            <div className="aspect-[9/17] bg-cream px-4 py-5">
              <p className="label text-ink/40">{t.app.inviteTitle}</p>
              <p className="mt-5 font-display text-2xl italic leading-[.95] text-ink">
                Ihr Tisch.
              </p>
              <p className="mt-4 font-sans text-xs leading-relaxed text-ink/55">
                {t.app.inviteBody}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[16rem] max-w-[28ch] pb-2">
          <p className="label text-ink/45">{t.app.label}</p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-[.95] tracking-[-.03em] md:text-4xl">
            {t.app.title}
          </h2>
          <p className="mt-3 font-sans text-sm leading-relaxed text-ink/50">
            {t.app.body}
          </p>

          {mode === "prompt" && (
            <button
              type="button"
              data-cursor="cta"
              onClick={() => void install()}
              className="mt-5 inline-flex min-h-11 items-center bg-accent px-5 font-sans text-sm font-medium text-paper"
            >
              {t.app.install}
            </button>
          )}
          {mode === "ios" && (
            <p className="mt-5 font-display text-sm italic text-ink/55">
              {t.app.installIos}
            </p>
          )}
          {mode === "hint" && (
            <p className="mt-5 font-display text-sm italic text-ink/45">
              {t.app.installHint}
            </p>
          )}
          {mode === "done" && (
            <p className="mt-5 font-display text-sm italic text-ink/55">
              {t.app.installDone}
            </p>
          )}

          <p className="mt-5 font-sans text-xs text-ink/35">
            {t.app.storeIos}
            {" · "}
            {t.app.storeAndroid}
          </p>
        </div>
      </div>
    </section>
  );
}
