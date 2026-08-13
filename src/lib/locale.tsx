"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { copy, defaultLocale, type Copy, type Locale } from "@/lib/copy";

const STORAGE_KEY = "wk-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Copy;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const listeners = new Set<() => void>();
let memory: Locale | null = null;

function emit() {
  listeners.forEach((fn) => fn());
}

function readStored(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "en" || raw === "de" ? raw : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Locale {
  return memory ?? readStored();
}

function commitLocale(next: Locale) {
  memory = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode */
  }
  emit();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => defaultLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = copy[locale].meta.title;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    commitLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    commitLocale(locale === "de" ? "en" : "de");
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: copy[locale],
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useT() {
  return useLocale().t;
}

/** Quiet language switch — footer, not an airport chip. */
export function LocaleToggle({
  className = "",
  dim = false,
}: {
  className?: string;
  dim?: boolean;
}) {
  const { locale, setLocale } = useLocale();
  const idle = dim ? "text-ivory/45 hover:text-ivory" : "text-muted hover:text-ink";
  const active = dim ? "text-ivory" : "text-ink";

  return (
    <div
      className={`flex flex-col items-start gap-1 font-sans text-sm ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        data-cursor="link"
        onClick={() => setLocale("de")}
        className={`transition-colors ${locale === "de" ? active : idle}`}
        aria-pressed={locale === "de"}
      >
        Deutsch
      </button>
      <button
        type="button"
        data-cursor="link"
        onClick={() => setLocale("en")}
        className={`transition-colors ${locale === "en" ? active : idle}`}
        aria-pressed={locale === "en"}
      >
        English
      </button>
    </div>
  );
}
