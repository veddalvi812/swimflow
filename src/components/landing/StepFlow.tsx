"use client";

import { ScrollReveal } from "./ScrollReveal";

const steps = [
  {
    title: "Describe your process",
    description:
      "Type what happens step by step in plain language. SwimFlow builds a structured prompt with the right JSON schema.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 5h12M4 9h8M4 13h10" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Copy to any AI",
    description:
      "One click copies the prompt to your clipboard. Paste it into ChatGPT, Claude, Gemini, or any LLM.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="6" y="3" width="10" height="13" rx="2" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M4 7v7a2 2 0 002 2h6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Paste and edit",
    description:
      "Paste the AI's JSON response back. Your diagram appears instantly, ready to refine on the canvas.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10l5 5L17 5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function StepFlow() {
  return (
    <div className="mt-16 grid gap-4 md:grid-cols-3">
      {steps.map((step, i) => (
        <ScrollReveal key={step.title} delay={i * 100}>
          <div className="group relative rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-6 transition-colors hover:border-[#d4d4d8]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[#e4e4e7]">
              {step.icon}
            </div>
            <h3 className="text-[15px] font-semibold text-[#1a1a1a]">{step.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[#71717a]">
              {step.description}
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
