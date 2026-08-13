"use client";

import { ViewTransition } from "react";
import type { ReactNode } from "react";

/**
 * Same light, next room — directional walk between house and kitchen.
 * Client boundary: ViewTransition is a React client primitive, not an RSC walk.
 */
export function Room({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
