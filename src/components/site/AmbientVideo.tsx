"use client";

import { useEffect, useRef, useState } from "react";

type AmbientVideoProps = {
  src: string;
  /** Optional still for non–video-only surfaces. */
  poster?: string;
  className?: string;
  position?: string;
  /**
   * Hero mode: never show a still image (no poster, no <img> fallback).
   * Reduced motion → paused video on first frame instead.
   */
  videoOnly?: boolean;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Muted ambient loop. Use videoOnly on the hero so a still never appears.
 */
export function AmbientVideo({
  src,
  poster,
  className = "",
  position = "center",
  videoOnly = false,
}: AmbientVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(() => videoOnly || !prefersReducedMotion());

  useEffect(() => {
    if (videoOnly) {
      setUseVideo(true);
      const v = ref.current;
      if (!v) return;
      if (prefersReducedMotion()) {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {
          /* ignore */
        }
        return;
      }
      v.play().catch(() => {
        /* keep video element — never fall back to an image */
      });
      return;
    }

    if (!useVideo) return;
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => setUseVideo(false));
  }, [src, useVideo, videoOnly]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {useVideo || videoOnly ? (
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
          onError={videoOnly ? undefined : () => setUseVideo(false)}
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : null}
    </div>
  );
}
