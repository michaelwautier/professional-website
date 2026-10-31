import type { CSSProperties } from "react";
import type { SiteContent, SiteStyle } from "@/lib/site-schema";

export const PALETTE = [
  { name: "Bleu nuit", value: "#1e3a8a" },
  { name: "Océan", value: "#0e7490" },
  { name: "Forêt", value: "#166534" },
  { name: "Terracotta", value: "#c2410c" },
  { name: "Bordeaux", value: "#9f1239" },
  { name: "Prune", value: "#6b21a8" },
  { name: "Moutarde", value: "#b45309" },
  { name: "Anthracite", value: "#27272a" },
];

export const STYLES: Record<
  SiteStyle,
  { label: string; description: string; vars: Record<string, string> }
> = {
  moderne: {
    label: "Moderne",
    description: "Net et aéré, idéal pour les services et le conseil",
    vars: {
      "--site-bg": "#ffffff",
      "--site-surface": "#f4f5f7",
      "--site-text": "#111318",
      "--site-muted": "#5b6170",
      "--site-border": "#e4e6eb",
      "--site-radius": "14px",
      "--site-font-heading": "var(--font-geist-sans)",
      "--site-font-body": "var(--font-geist-sans)",
      "--site-heading-weight": "700",
      "--site-heading-tracking": "-0.03em",
    },
  },
  elegant: {
    label: "Élégant",
    description: "Raffiné, avec une typographie classique",
    vars: {
      "--site-bg": "#fbf9f5",
      "--site-surface": "#f2eee6",
      "--site-text": "#1c1a17",
      "--site-muted": "#6b655b",
      "--site-border": "#e3ddd1",
      "--site-radius": "2px",
      "--site-font-heading": "var(--font-playfair)",
      "--site-font-body": "var(--font-geist-sans)",
      "--site-heading-weight": "500",
      "--site-heading-tracking": "-0.01em",
    },
  },
  chaleureux: {
    label: "Chaleureux",
    description: "Doux et accueillant, parfait pour les commerces de proximité",
    vars: {
      "--site-bg": "#fffaf3",
      "--site-surface": "#fbefe1",
      "--site-text": "#2a1f16",
      "--site-muted": "#7a6656",
      "--site-border": "#f0e0cc",
      "--site-radius": "26px",
      "--site-font-heading": "var(--font-fraunces)",
      "--site-font-body": "var(--font-dm-sans)",
      "--site-heading-weight": "600",
      "--site-heading-tracking": "-0.02em",
    },
  },
};

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Couleur de texte lisible (blanc ou presque noir) sur un fond de la couleur donnée. */
export function contrastText(hex: string) {
  return luminance(hex) > 0.4 ? "#111318" : "#ffffff";
}

export function themeVars(theme: SiteContent["theme"]): CSSProperties {
  return {
    ...STYLES[theme.style].vars,
    "--site-brand": theme.color,
    "--site-brand-ink": contrastText(theme.color),
  } as CSSProperties;
}
