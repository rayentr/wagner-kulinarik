import type { ComponentType, ReactNode } from "react";

declare module "react" {
  export const ViewTransition: ComponentType<{
    children?: ReactNode;
    name?: string;
    default?: string | Record<string, string>;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    share?: string | Record<string, string>;
    update?: string | Record<string, string>;
  }>;
}
