import Link from "next/link";
import { DiagramHero } from "@/components/landing/DiagramHero";
import { StepFlow } from "@/components/landing/StepFlow";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="5" rx="1.5" fill="#2563eb" />
              <rect x="2" y="10" width="20" height="5" rx="1.5" fill="#60a5fa" />
              <rect x="2" y="17" width="20" height="5" rx="1.5" fill="#bfdbfe" />
              <circle cx="8" cy="5.5" r="1.5" fill="white" />
              <circle cx="14" cy="12.5" r="1.5" fill="white" />
              <circle cx="10" cy="19.5" r="1.5" fill="white" />
              <line x1="9.5" y1="5.5" x2="12.5" y2="12.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
              <line x1="12.5" y1="12.5" x2="10" y2="17.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            </svg>
            SwimFlow
          </Link>
          <Link
            href="/editor"
            className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Open Editor
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-14">
          <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 md:pb-24 md:pt-28">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="max-w-xl">
                <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
                  Swimlane diagrams,{" "}
                  <span className="text-[#2563eb]">generated from words.</span>
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
                  Describe your process in plain text. Copy a structured prompt to any AI.
                  Paste the JSON back. SwimFlow renders and lets you edit it on an infinite canvas.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-[15px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1d4ed8] hover:shadow-blue-500/30"
                  >
                    Start building
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Free, no sign-up required
                  </span>
                </div>
              </div>

              <div className="relative">
                <DiagramHero />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <h2 className="text-center text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.025em]">
              Three steps. Any AI. Your diagram.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-[var(--muted-foreground)]">
              SwimFlow works with ChatGPT, Claude, Gemini, or any LLM you prefer.
              No API keys, no vendor lock-in.
            </p>
            <StepFlow />
          </div>
        </section>

        {/* Feature: Canvas */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.025em]">
                  Edit everything on an infinite canvas
                </h2>
                <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                  Double-click to rename nodes. Drag to reposition. Select edges to change labels.
                  The properties panel gives you full control over colors, styles, and connections.
                </p>
                <ul className="mt-6 space-y-3 text-[15px]">
                  {[
                    "Inline editing with double-click on any node",
                    "Auto-layout with Dagre for clean arrangements",
                    "Export to PNG at 2x retina resolution",
                    "Properties panel for node, edge, and diagram settings",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#2563eb]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--canvas-bg)]">
                  <CanvasPreview />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prompt Template */}
        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="order-2 lg:order-1">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 font-mono text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                  <p className="text-[var(--foreground)] font-medium font-sans text-sm mb-3">The prompt SwimFlow generates for you:</p>
                  <pre className="whitespace-pre-wrap text-[12px]">{`Generate a swimlane diagram as JSON.

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
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.025em]">
                  Your AI, your rules
                </h2>
                <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                  SwimFlow generates a structured prompt from your process description.
                  Copy it to any AI chat. The AI returns JSON that SwimFlow understands instantly.
                </p>
                <p className="mt-4 text-[var(--muted-foreground)] leading-relaxed">
                  No API keys to manage. No monthly subscriptions.
                  Use the AI you already have access to.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center md:py-32">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em]">
              Ready to map your process?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-[var(--muted-foreground)]">
              Open the editor, describe what happens, and let any AI do the heavy lifting.
            </p>
            <Link
              href="/editor"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-8 py-3.5 text-[15px] font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-[#1d4ed8] hover:shadow-blue-500/30"
            >
              Open the editor
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-sm text-[var(--muted-foreground)]">
          <span>SwimFlow</span>
          <span>Free and open source</span>
        </div>
      </footer>
    </div>
  );
}

function CanvasPreview() {
  return (
    <svg viewBox="0 0 560 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      {/* Grid dots */}
      <defs>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.75" fill="#d4d4d8" opacity="0.5"/>
        </pattern>
      </defs>
      <rect width="560" height="420" fill="#fafafa"/>
      <rect width="560" height="420" fill="url(#dots)"/>

      {/* Lane backgrounds */}
      <rect x="40" y="60" width="480" height="100" rx="4" fill="#dbeafe" opacity="0.5" stroke="#93c5fd" strokeWidth="0.5"/>
      <rect x="40" y="165" width="480" height="100" rx="4" fill="#dcfce7" opacity="0.5" stroke="#86efac" strokeWidth="0.5"/>
      <rect x="40" y="270" width="480" height="100" rx="4" fill="#fef3c7" opacity="0.5" stroke="#fcd34d" strokeWidth="0.5"/>

      {/* Lane labels */}
      <text x="55" y="82" fill="#1e40af" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Customer</text>
      <text x="55" y="187" fill="#166534" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Support</text>
      <text x="55" y="292" fill="#92400e" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Engineering</text>

      {/* Start node */}
      <rect x="110" y="95" width="70" height="30" rx="15" fill="#09090b"/>
      <text x="145" y="114" fill="white" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">Start</text>

      {/* Process nodes */}
      <rect x="220" y="95" width="100" height="32" rx="6" fill="white" stroke="#e4e4e7"/>
      <text x="270" y="115" fill="#09090b" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Submit ticket</text>

      {/* Decision diamond */}
      <g transform="translate(390, 110)">
        <rect x="-22" y="-22" width="44" height="44" rx="4" fill="white" stroke="#e4e4e7" transform="rotate(45)"/>
        <text y="4" fill="#09090b" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Priority?</text>
      </g>

      {/* Support nodes */}
      <rect x="220" y="182" width="100" height="32" rx="6" fill="white" stroke="#e4e4e7"/>
      <text x="270" y="202" fill="#09090b" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Review ticket</text>

      <rect x="370" y="182" width="100" height="32" rx="6" fill="white" stroke="#e4e4e7"/>
      <text x="420" y="202" fill="#09090b" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Escalate</text>

      {/* Engineering node */}
      <rect x="290" y="287" width="110" height="32" rx="6" fill="white" stroke="#e4e4e7"/>
      <text x="345" y="307" fill="#09090b" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Resolve issue</text>

      {/* End node */}
      <rect x="440" y="287" width="60" height="30" rx="15" fill="#09090b"/>
      <text x="470" y="306" fill="white" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">End</text>

      {/* Edges */}
      <line x1="180" y1="110" x2="218" y2="110" stroke="#71717a" strokeWidth="1.2" markerEnd="url(#arrowhead)"/>
      <line x1="320" y1="110" x2="360" y2="110" stroke="#71717a" strokeWidth="1.2" markerEnd="url(#arrowhead)"/>
      <line x1="270" y1="127" x2="270" y2="180" stroke="#71717a" strokeWidth="1.2" markerEnd="url(#arrowhead)"/>
      <line x1="390" y1="132" x2="420" y2="180" stroke="#71717a" strokeWidth="1.2" markerEnd="url(#arrowhead)"/>
      <line x1="320" y1="198" x2="368" y2="198" stroke="#71717a" strokeWidth="1.2" markerEnd="url(#arrowhead)"/>
      <line x1="420" y1="214" x2="345" y2="285" stroke="#71717a" strokeWidth="1.2" markerEnd="url(#arrowhead)"/>
      <line x1="400" y1="303" x2="438" y2="303" stroke="#71717a" strokeWidth="1.2" markerEnd="url(#arrowhead)"/>

      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="#71717a"/>
        </marker>
      </defs>

      {/* Floating toolbar hint */}
      <rect x="190" y="20" width="180" height="30" rx="8" fill="white" stroke="#e4e4e7" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"/>
      <circle cx="210" cy="35" r="4" fill="#e4e4e7"/>
      <circle cx="225" cy="35" r="4" fill="#e4e4e7"/>
      <rect x="240" y="31" width="1" height="8" fill="#e4e4e7" rx="0.5"/>
      <circle cx="255" cy="35" r="4" fill="#e4e4e7"/>
      <circle cx="270" cy="35" r="4" fill="#e4e4e7"/>
      <circle cx="285" cy="35" r="4" fill="#e4e4e7"/>
      <rect x="300" y="31" width="1" height="8" fill="#e4e4e7" rx="0.5"/>
      <rect x="310" y="29" width="48" height="12" rx="4" fill="#2563eb"/>
      <text x="334" y="38" fill="white" fontSize="7" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Export</text>
    </svg>
  );
}
