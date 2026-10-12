"use client";

import { ScrollReveal } from "./ScrollReveal";

const features = [
  {
    title: "Inline editing",
    description: "Double-click any node to rename it in place. No modals, no sidebars.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Auto-layout",
    description: "Dagre arranges nodes cleanly with one click. Adjust manually after.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="5" height="5" rx="1" stroke="#3b82f6" strokeWidth="1.5" />
        <rect x="12" y="3" width="5" height="5" rx="1" stroke="#3b82f6" strokeWidth="1.5" />
        <rect x="7.5" y="12" width="5" height="5" rx="1" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M5.5 8v2a2 2 0 002 2M14.5 8v2a2 2 0 01-2 2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "PNG export",
    description: "Export at 2x retina resolution. Canvas2D rendering, no DOM cloning.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M3 13l4-4 3 3 2-2 5 5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Properties panel",
    description: "Select any node or edge. Change labels, colors, and styles in the side panel.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h14M3 15h8" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15" cy="15" r="2" stroke="#3b82f6" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <div className="mt-14 grid gap-4 sm:grid-cols-2">
      {features.map((feature, i) => (
        <ScrollReveal key={feature.title} delay={i * 80}>
          <div className="rounded-xl border border-[#27272a] bg-[#111113] p-6 transition-colors hover:border-[#3f3f46]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#18181b]">
              {feature.icon}
            </div>
            <h3 className="text-[15px] font-semibold text-[#f2efe9]">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#71717a]">{feature.description}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
