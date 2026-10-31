"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};

/** Ne rend ses enfants qu'après l'hydratation : nécessaire pour lire le brouillon dans localStorage. */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  return isClient ? children : fallback;
}
