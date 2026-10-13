import type { CSSProperties } from "react";

// Optional look settings any free object can carry in its data.
export interface Look {
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  font?: keyof typeof FONTS;
  href?: string;
  align?: "left" | "center" | "right";
  textColor?: string;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
  fillOpacity?: number;
  radius?: number;
  locked?: boolean;
}

export const FONTS = {
  sans: { label: "Sans", css: undefined },
  serif: { label: "Serif", css: "Georgia, 'Times New Roman', serif" },
  mono: { label: "Mono", css: "ui-monospace, Menlo, Consolas, monospace" },
  hand: { label: "Handwritten", css: "'Comic Sans MS', 'Bradley Hand', cursive" },
} as const;

export const textStyle = (d: Look): CSSProperties => ({
  fontFamily: d.font ? FONTS[d.font]?.css : undefined,
  textDecoration: d.strike ? "line-through" : undefined,
  fontSize: d.fontSize,
  fontWeight: d.bold ? 700 : undefined,
  fontStyle: d.italic ? "italic" : undefined,
  textAlign: d.align,
  color: d.textColor,
});

// "#rgb" or "#rrggbb" plus an opacity from 0 to 1.
export function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const SHAPES = [
  { id: "rect", label: "Rectangle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "diamond", label: "Diamond" },
  { id: "hexagon", label: "Hexagon" },
  { id: "parallelogram", label: "Parallelogram" },
  { id: "triangle", label: "Triangle" },
  { id: "star", label: "Star" },
  { id: "cylinder", label: "Database" },
  { id: "document", label: "Document" },
  { id: "cloud", label: "Cloud" },
] as const;

export const STAMPS = ["✅", "❌", "⚠️", "❓", "❗", "⭐", "🔥", "💡", "👍", "👎", "❤️", "🎯", "🚀", "🏁", "⏱️", "📌", "🔒", "🔑", "📎", "📝", "💬", "👀", "🎉", "💰"];

// Only web links and mail links are allowed on link cards.
export function safeUrl(raw: string): string | null {
  try {
    const u = new URL(/^[a-z]+:/i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
}
