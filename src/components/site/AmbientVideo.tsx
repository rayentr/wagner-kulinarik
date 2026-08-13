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
  /**
   * Only attach src / play when near viewport.
   * Default true for non-hero; hero should pass lazy={false}.
   */
  lazy?: boolean;
  /** Browser preload hint. Prefer "none" below the fold. */
  preload?: "none" | "metadata" | "auto";
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Muted ambient loop. Use videoOnly on the hero so a still never appears.
 * Below-fold: poster + lazy load with preload="none".
 */
export function AmbientVideo({
  src,
  poster,
  className = "",
  position = "center",
  videoOnly = false,
  lazy = !videoOnly,
  preload = videoOnly ? "metadata" : "none",
}: AmbientVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion] = useState(() => prefersReducedMotion());
  const [inView, setInView] = useState(!lazy);
  const [useVideo, setUseVideo] = useState(
    () => videoOnly || !prefersReducedMotion(),
  );

  useEffect(() => {
    if (!lazy || inView) return;
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, inView]);

  useEffect(() => {
    if (!inView) return;

    if (videoOnly) {
      const v = videoRef.current;
      if (!v) return;
      if (reduceMotion) {
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
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setUseVideo(false));
  }, [src, useVideo, videoOnly, inView, reduceMotion]);

  /* Poster stays under the video so the well never flashes empty/white. */
  const showPoster = Boolean(poster) && !videoOnly;
  const showVideo = inView && (useVideo || videoOnly);

  return (
    <div ref={rootRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {showPoster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
          loading="lazy"
          decoding="async"
        />
      )}
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
          src={src}
          poster={videoOnly ? undefined : poster}
          muted
          loop
          playsInline
          autoPlay={!reduceMotion}
          preload={preload}
          aria-hidden
          onError={videoOnly ? undefined : () => setUseVideo(false)}
        />
      )}
    </div>
  );
}
