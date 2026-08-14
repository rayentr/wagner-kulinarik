"use client";

import { useCallback, useRef } from "react";
import {
  gsap,
  isCoarsePointer,
  isFinePointer,
  prefersReducedMotion,
  useGSAP,
} from "@/lib/gsap";

/** Guest — the room leans. Not a carnival. */
const TILT_MAX = 3.2;
const DEVICE_RANGE = 16;

/** Hunger — you look into the plate. Still not a turntable. */
const ORBIT_X = 8;
const ORBIT_Y = 12;
const PHOTO_SHIFT = 16;

type OrientCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

/**
 * iOS needs a user gesture. Android usually does not.
 * Fine pointer and reduced motion never ask.
 */
export async function requestOrientationAccess() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion() || !isCoarsePointer()) return false;
  const DOE = window.DeviceOrientationEvent as OrientCtor | undefined;
  if (!DOE) return false;
  if (typeof DOE.requestPermission === "function") {
    try {
      return (await DOE.requestPermission()) === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * The plate in Z: device tilt as a guest, finger/pointer orbit as hunger.
 * CSS 3D only — no scene graph. Covered dishes stay still.
 */
export function usePlateTilt(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const allowed = useRef(false);
  const origin = useRef<{ beta: number; gamma: number } | null>(null);
  const orbit = useRef({ x: 0, y: 0 });
  const guest = useRef({ x: 0, y: 0 });
  const rotX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const photoX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const photoY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const apply = useCallback((ease = true) => {
    const x = gsap.utils.clamp(-ORBIT_X - TILT_MAX, ORBIT_X + TILT_MAX, orbit.current.x + guest.current.x);
    const y = gsap.utils.clamp(-ORBIT_Y - TILT_MAX, ORBIT_Y + TILT_MAX, orbit.current.y + guest.current.y);
    if (ease && rotX.current && rotY.current) {
      rotX.current(x);
      rotY.current(y);
    } else if (ref.current) {
      gsap.set(ref.current, { rotationX: x, rotationY: y });
    }
    if (photoX.current && photoY.current) {
      photoX.current((-y / ORBIT_Y) * PHOTO_SHIFT);
      photoY.current((x / ORBIT_X) * PHOTO_SHIFT);
    }
  }, []);

  const engage = useCallback(() => {
    if (allowed.current) return;
    if (prefersReducedMotion() || !isCoarsePointer()) return;
    void requestOrientationAccess().then((ok) => {
      allowed.current = ok;
    });
  }, []);

  const look = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!active || prefersReducedMotion()) return;
      const w = Math.max(ref.current?.offsetWidth ?? 320, 1);
      orbit.current.y = gsap.utils.clamp(
        -ORBIT_Y,
        ORBIT_Y,
        orbit.current.y + (deltaX / w) * 32,
      );
      orbit.current.x = gsap.utils.clamp(
        -ORBIT_X,
        ORBIT_X,
        orbit.current.x - (deltaY / w) * 22,
      );
      apply();
    },
    [active, apply],
  );

  const rest = useCallback(() => {
    orbit.current = { x: 0, y: 0 };
    const el = ref.current;
    const photo = photoRef.current;
    if (!el) return;
    gsap.to(el, {
      rotationX: guest.current.x,
      rotationY: guest.current.y,
      duration: 0.7,
      ease: "lc.soft",
      overwrite: "auto",
    });
    if (photo) {
      gsap.to(photo, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "lc.soft",
        overwrite: "auto",
      });
    }
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.set(el, {
        transformPerspective: 900,
        transformOrigin: "50% 58%",
        z: 16,
      });

      rotX.current = gsap.quickTo(el, "rotationX", {
        duration: 0.45,
        ease: "lc.soft",
      });
      rotY.current = gsap.quickTo(el, "rotationY", {
        duration: 0.45,
        ease: "lc.soft",
      });
      if (photoRef.current) {
        photoX.current = gsap.quickTo(photoRef.current, "x", {
          duration: 0.5,
          ease: "lc.soft",
        });
        photoY.current = gsap.quickTo(photoRef.current, "y", {
          duration: 0.5,
          ease: "lc.soft",
        });
      }

      const reset = () => {
        origin.current = null;
        orbit.current = { x: 0, y: 0 };
        guest.current = { x: 0, y: 0 };
        gsap.set(el, { rotationX: 0, rotationY: 0 });
        if (photoRef.current) gsap.set(photoRef.current, { x: 0, y: 0 });
      };

      if (!active || prefersReducedMotion()) {
        reset();
        return;
      }

      const onOrient = (e: DeviceOrientationEvent) => {
        if (!allowed.current) return;
        if (e.beta == null || e.gamma == null) return;
        if (!origin.current) {
          origin.current = { beta: e.beta, gamma: e.gamma };
        }
        const dBeta = gsap.utils.clamp(
          -DEVICE_RANGE,
          DEVICE_RANGE,
          e.beta - origin.current.beta,
        );
        const dGamma = gsap.utils.clamp(
          -DEVICE_RANGE,
          DEVICE_RANGE,
          e.gamma - origin.current.gamma,
        );
        guest.current.x = gsap.utils.mapRange(
          -DEVICE_RANGE,
          DEVICE_RANGE,
          TILT_MAX,
          -TILT_MAX,
          dBeta,
        );
        guest.current.y = gsap.utils.mapRange(
          -DEVICE_RANGE,
          DEVICE_RANGE,
          -TILT_MAX,
          TILT_MAX,
          dGamma,
        );
        apply();
      };

      const onMove = (e: PointerEvent) => {
        if (!isFinePointer() || e.pointerType !== "mouse") return;
        const box = el.getBoundingClientRect();
        if (box.width < 8 || box.height < 8) return;
        const nx = (e.clientX - box.left) / box.width - 0.5;
        const ny = (e.clientY - box.top) / box.height - 0.5;
        orbit.current.y = gsap.utils.clamp(-ORBIT_Y, ORBIT_Y, nx * 16);
        orbit.current.x = gsap.utils.clamp(-ORBIT_X, ORBIT_X, -ny * 10);
        apply();
      };

      const onLeave = () => {
        if (!isFinePointer()) return;
        rest();
      };

      window.addEventListener("deviceorientation", onOrient);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      return () => {
        window.removeEventListener("deviceorientation", onOrient);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        rotX.current = null;
        rotY.current = null;
        photoX.current = null;
        photoY.current = null;
        reset();
      };
    },
    { dependencies: [active, apply, rest] },
  );

  return { ref, photoRef, engage, look, rest };
}
