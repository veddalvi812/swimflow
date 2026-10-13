import Link from "next/link";
import { HeroDiagram } from "@/components/landing/HeroDiagram";
import { StepFlow } from "@/components/landing/StepFlow";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Features } from "@/components/landing/Features";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight text-[#1a1a1a]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="5" rx="1.5" fill="#3b82f6" />
              <rect x="2" y="10" width="20" height="5" rx="1.5" fill="#60a5fa" />
              <rect x="2" y="17" width="20" height="5" rx="1.5" fill="#93c5fd" />
              <circle cx="8" cy="5.5" r="1.5" fill="white" />
              <circle cx="14" cy="12.5" r="1.5" fill="white" />
              <circle cx="10" cy="19.5" r="1.5" fill="white" />
              <line x1="9.5" y1="5.5" x2="12.5" y2="12.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
              <line x1="12.5" y1="12.5" x2="10" y2="17.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>
            SwimFlow
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#52525b] hover:text-[#1a1a1a]">
              Log in
            </Link>
            <Link
              href="/editor"
              className="rounded-full bg-[#1a1a1a] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Open Editor
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Atmospheric gradient */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-blue-500/[0.06] blur-[120px]" />
            <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/[0.04] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-32 text-center md:pb-16 md:pt-40">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-[#f4f4f5] px-4 py-1.5 text-sm text-[#71717a]">
              <span className="rounded-full bg-[#3b82f6] px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
              <span>A free whiteboard for processes and plans</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-[clamp(2.5rem,7vw,4.5rem)] font-medium leading-[1] tracking-[-0.03em]">
              Describe it.{" "}
              <br className="hidden sm:block" />
              Any AI draws it.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#71717a]">
              Tell SwimFlow what you&apos;re making. Copy the prompt to ChatGPT, Claude, or Gemini, paste the answer back,
              and edit swimlanes, flowcharts, kanban boards, timelines, and tables on one canvas.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/editor"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-7 py-3 text-[15px] font-medium text-white transition-all hover:bg-black hover:shadow-lg hover:shadow-blue-500/10"
              >
                Start building
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <span className="text-sm text-[#a1a1aa]">
                Free, no sign-up required
              </span>
            </div>
          </div>

          {/* Hero diagram */}
          <div className="relative mx-auto max-w-5xl px-4 pb-24">
            <HeroDiagram />
          </div>
        </section>

        {/* How It Works */}
        <section className="relative border-t border-[#e4e4e7]">
          <div className="mx-auto max-w-5xl px-4 py-28 md:py-36">
            <ScrollReveal>
              <h2 className="text-center text-[clamp(1.75rem,4vw,2.75rem)] font-medium tracking-[-0.025em]">
                Three steps. Any AI. Your diagram.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-center text-[#71717a]">
                SwimFlow works with ChatGPT, Claude, Gemini, or any LLM.
                No API keys, no vendor lock-in.
              </p>
            </ScrollReveal>
            <StepFlow />
          </div>
        </section>

        {/* Live Demo */}
        <section className="relative border-t border-[#e4e4e7]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-blue-500/[0.04] blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 py-28 md:py-36">
            <ScrollReveal>
              <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-medium tracking-[-0.025em]">
                See it in action
              </h2>
              <p className="mt-5 max-w-lg text-[#71717a]">
                Type a process description below. SwimFlow generates the prompt you&apos;d copy to any AI,
                then renders the result on a canvas.
              </p>
            </ScrollReveal>
            <LiveDemo />
          </div>
        </section>

        {/* Features */}
        <section className="relative border-t border-[#e4e4e7]">
          <div className="mx-auto max-w-5xl px-4 py-28 md:py-36">
            <ScrollReveal>
              <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-medium tracking-[-0.025em]">
                Edit everything on{" "}
                <br className="hidden sm:block" />
                an infinite canvas
              </h2>
              <p className="mt-5 max-w-lg text-[#71717a]">
                Double-click nodes to rename them. Drag to reposition. The properties panel
                gives you full control over colors, styles, and connections.
              </p>
            </ScrollReveal>
            <Features />
          </div>
        </section>

        {/* Prompt Template */}
        <section className="relative border-t border-[#e4e4e7]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/[0.04] blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 py-28 md:py-36">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <ScrollReveal>
                <div className="rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-6">
                  <p className="mb-4 text-sm font-medium text-[#71717a]">The prompt SwimFlow generates for you</p>
                  <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-[#52525b]">{`Generate a swimlane diagram as JSON.

Process: "{your description here}"

Return this exact structure:
{
  "title": "...",
  "lanes": [
    { "id": "lane-1", "label": "..." }
  ],
  "nodes": [
    { "id": "n1", "type": "start",
      "label": "...", "lane": "lane-1" }
  ],
  "edges": [
    { "id": "e1", "from": "n1",
      "to": "n2", "label": "..." }
  ]
}`}</pre>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-medium tracking-[-0.025em]">
                  Your AI, your rules
                </h2>
                <p className="mt-4 leading-relaxed text-[#71717a]">
                  SwimFlow generates a structured prompt from your process description.
                  Copy it to any AI chat. The AI returns JSON that SwimFlow understands instantly.
                </p>
                <p className="mt-4 leading-relaxed text-[#71717a]">
                  No API keys to manage. No monthly subscriptions.
                  Use the AI you already have access to.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative border-t border-[#e4e4e7]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 bottom-0 h-[400px] w-[700px] -translate-x-1/2 translate-y-1/3 rounded-full bg-blue-500/[0.06] blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-28 text-center md:py-40">
            <ScrollReveal>
              <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] font-medium tracking-[-0.025em]">
                Ready to map your process?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-lg text-[#71717a]">
                Open the editor, describe what happens, and let any AI do the heavy lifting.
              </p>
              <Link
                href="/editor"
                className="group mt-10 inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-8 py-3.5 text-[15px] font-medium text-white transition-all hover:bg-black hover:shadow-lg hover:shadow-blue-500/10"
              >
                Open the editor
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e4e4e7]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 text-sm text-[#a1a1aa]">
          <span>SwimFlow</span>
          <span>Free and open source</span>
        </div>
      </footer>
    </div>
  );
}
