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

/** One decoder at a time — the visible clip owns the job. */
let activeClip: HTMLVideoElement | null = null;

function claimClip(v: HTMLVideoElement) {
  if (activeClip && activeClip !== v) {
    activeClip.pause();
  }
  activeClip = v;
}

function releaseClip(v: HTMLVideoElement) {
  if (activeClip === v) activeClip = null;
}

/**
 * Muted ambient loop. Use videoOnly on the hero so a still never appears.
 * Below-fold: poster image under the video (never the video poster attr).
 * Only the on-screen clip plays.
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
  const [attached, setAttached] = useState(!lazy);
  const [visible, setVisible] = useState(!lazy);
  const [useVideo, setUseVideo] = useState(
    () => videoOnly || !prefersReducedMotion(),
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const on = Boolean(entry?.isIntersecting);
        if (on) setAttached(true);
        setVisible(on);
      },
      {
        rootMargin: lazy && !attached ? "200px 0px" : "0px",
        threshold: 0.2,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy, attached]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (!attached || !visible || !useVideo) {
      v.pause();
      releaseClip(v);
      return;
    }

    if (videoOnly && reduceMotion) {
      v.pause();
      releaseClip(v);
      try {
        v.currentTime = 0;
      } catch {
        /* ignore */
      }
      return;
    }

    claimClip(v);
    v.play().catch(() => {
      if (!videoOnly) setUseVideo(false);
    });

    return () => {
      v.pause();
      releaseClip(v);
    };
  }, [src, useVideo, videoOnly, attached, visible, reduceMotion]);

  /* Still sits under the video so the well never flashes empty/white. */
  const showPoster = Boolean(poster) && !videoOnly;
  const showVideo = attached && (useVideo || videoOnly);

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
          className="absolute inset-0 h-full w-full bg-night object-cover"
          style={{ objectPosition: position }}
          src={src}
          muted
          loop
          playsInline
          autoPlay={!reduceMotion}
          preload={preload}
          disablePictureInPicture
          aria-hidden
          onError={videoOnly ? undefined : () => setUseVideo(false)}
        />
      )}
    </div>
  );
}
