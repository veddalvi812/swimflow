"use client";

const steps = [
  {
    title: "Describe your process",
    description:
      "Type what happens step by step in plain language. SwimFlow builds a structured prompt with the right JSON schema.",
    visual: DescribeVisual,
  },
  {
    title: "Copy to any AI",
    description:
      "One click copies the prompt to your clipboard. Paste it into ChatGPT, Claude, Gemini, or any LLM you use.",
    visual: CopyVisual,
  },
  {
    title: "Paste and edit",
    description:
      "Paste the AI's JSON response back into SwimFlow. Your diagram appears instantly, ready to refine on the canvas.",
    visual: PasteVisual,
  },
];

export function StepFlow() {
  return (
    <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
      {steps.map((step, i) => (
        <div key={step.title} className="relative">
          {i < steps.length - 1 && (
            <div className="absolute right-0 top-1/3 hidden h-px w-8 translate-x-full bg-[var(--border)] md:block" />
          )}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
            <div className="mb-4 aspect-[5/3] overflow-hidden rounded-lg bg-[var(--surface)]">
              <step.visual />
            </div>
            <h3 className="text-[15px] font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DescribeVisual() {
  return (
    <svg viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="300" height="180" fill="#f4f4f5" />
      {/* Prompt bar mockup */}
      <rect x="30" y="60" width="240" height="60" rx="12" fill="white" stroke="#e4e4e7" />
      <text x="46" y="82" fill="#71717a" fontSize="10" fontFamily="Inter, sans-serif">Describe your process...</text>
      <rect x="46" y="92" width="160" height="1" fill="#e4e4e7" />
      <text x="46" y="108" fill="#09090b" fontSize="10" fontFamily="Inter, sans-serif">User submits a support ticket,</text>
      {/* Cursor blink */}
      <rect x="196" y="100" width="1.5" height="12" fill="#2563eb">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
      {/* Generate button */}
      <rect x="210" y="92" width="48" height="18" rx="6" fill="#2563eb" />
      <text x="234" y="104" fill="white" fontSize="8" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Generate</text>
    </svg>
  );
}

function CopyVisual() {
  return (
    <svg viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="300" height="180" fill="#f4f4f5" />
      {/* Clipboard icon */}
      <rect x="115" y="45" width="70" height="90" rx="6" fill="white" stroke="#e4e4e7" />
      <rect x="130" y="38" width="40" height="14" rx="4" fill="#2563eb" />
      <text x="150" y="49" fill="white" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">COPIED</text>
      {/* JSON lines */}
      <rect x="125" y="66" width="50" height="3" rx="1.5" fill="#e4e4e7" />
      <rect x="125" y="74" width="40" height="3" rx="1.5" fill="#e4e4e7" />
      <rect x="125" y="82" width="45" height="3" rx="1.5" fill="#e4e4e7" />
      <rect x="125" y="90" width="35" height="3" rx="1.5" fill="#e4e4e7" />
      <rect x="125" y="98" width="50" height="3" rx="1.5" fill="#e4e4e7" />
      <rect x="125" y="106" width="30" height="3" rx="1.5" fill="#e4e4e7" />
      <rect x="125" y="114" width="45" height="3" rx="1.5" fill="#e4e4e7" />
      {/* Checkmark */}
      <circle cx="150" cy="148" r="12" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
      <path d="M144,148 L148,152 L156,144" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PasteVisual() {
  return (
    <svg viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="300" height="180" fill="#f4f4f5" />
      {/* Mini canvas with diagram appearing */}
      <rect x="30" y="25" width="240" height="130" rx="6" fill="#fafafa" stroke="#e4e4e7" />
      {/* Mini lanes */}
      <rect x="40" y="40" width="220" height="32" rx="2" fill="#dbeafe" fillOpacity="0.3" />
      <rect x="40" y="76" width="220" height="32" rx="2" fill="#dcfce7" fillOpacity="0.3" />
      <rect x="40" y="112" width="220" height="32" rx="2" fill="#fef3c7" fillOpacity="0.3" />
      {/* Mini nodes */}
      <rect x="60" y="48" width="36" height="16" rx="8" fill="#09090b" />
      <rect x="115" y="48" width="50" height="16" rx="4" fill="white" stroke="#e4e4e7" strokeWidth="0.5" />
      <rect x="185" y="48" width="50" height="16" rx="4" fill="white" stroke="#e4e4e7" strokeWidth="0.5" />
      <rect x="115" y="84" width="50" height="16" rx="4" fill="white" stroke="#e4e4e7" strokeWidth="0.5" />
      <rect x="185" y="84" width="50" height="16" rx="4" fill="white" stroke="#e4e4e7" strokeWidth="0.5" />
      <rect x="150" y="118" width="50" height="16" rx="4" fill="white" stroke="#e4e4e7" strokeWidth="0.5" />
      <rect x="220" y="118" width="30" height="16" rx="8" fill="#09090b" />
      {/* Edges */}
      <line x1="96" y1="56" x2="113" y2="56" stroke="#71717a" strokeWidth="0.75" />
      <line x1="165" y1="56" x2="183" y2="56" stroke="#71717a" strokeWidth="0.75" />
      <line x1="140" y1="64" x2="140" y2="82" stroke="#71717a" strokeWidth="0.75" />
      <line x1="165" y1="92" x2="183" y2="92" stroke="#71717a" strokeWidth="0.75" />
      <line x1="210" y1="100" x2="175" y2="116" stroke="#71717a" strokeWidth="0.75" />
      <line x1="200" y1="126" x2="218" y2="126" stroke="#71717a" strokeWidth="0.75" />
      {/* Sparkle/appear effect */}
      <circle cx="150" cy="90" r="50" fill="none" stroke="#2563eb" strokeWidth="0.5" opacity="0.15">
        <animate attributeName="r" values="20;60" dur="1.5s" begin="0.5s" fill="freeze" />
        <animate attributeName="opacity" values="0.3;0" dur="1.5s" begin="0.5s" fill="freeze" />
      </circle>
    </svg>
  );
}
