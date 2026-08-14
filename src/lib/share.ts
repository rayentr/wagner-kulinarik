"use client";

export type ShareNight = {
  title: string;
  text: string;
  url?: string;
};

export type ShareResult = "shared" | "copied" | "aborted" | "failed";

/**
 * Web Share when the hand can; clipboard if the browser has no sheet.
 */
export async function shareNight(night: ShareNight): Promise<ShareResult> {
  if (typeof window === "undefined") return "failed";

  const url = night.url ?? `${window.location.origin}/#anlaesse`;
  const payload = { title: night.title, text: night.text, url };

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "aborted";
    }
  }

  try {
    await navigator.clipboard.writeText(`${night.title} — ${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

export function isAppleTouch() {
  if (typeof navigator === "undefined") return false;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
