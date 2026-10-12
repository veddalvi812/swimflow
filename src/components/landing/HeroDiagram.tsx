"use client";

import { useEffect, useRef } from "react";

export function HeroDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.animate(
      [{ opacity: 0, transform: "translateY(20px) scale(0.98)" }, { opacity: 1, transform: "translateY(0) scale(1)" }],
      { duration: 800, delay: 300, fill: "forwards", easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    );
  }, []);

  return (
    <div ref={containerRef} className="opacity-0">
      <div className="rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-3 shadow-xl shadow-black/5">
        <svg viewBox="0 0 800 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-lg">
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="#d4d4d8" opacity="0.6" />
            </pattern>
            <marker id="h-arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <path d="M0,0 L7,2.5 L0,5" fill="#3b82f6" opacity="0.7" />
            </marker>
            <linearGradient id="lane-blue-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="lane-green-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="lane-amber-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          <rect width="800" height="440" fill="#fafafa" rx="8" />
          <rect width="800" height="440" fill="url(#hero-grid)" rx="8" />

          {/* Toolbar */}
          <rect x="280" y="16" width="240" height="32" rx="8" fill="white" stroke="#e4e4e7" strokeWidth="0.5" />
          <circle cx="305" cy="32" r="5" fill="#e4e4e7" />
          <circle cx="322" cy="32" r="5" fill="#e4e4e7" />
          <rect x="338" y="28" width="1" height="8" fill="#e4e4e7" rx="0.5" />
          <circle cx="352" cy="32" r="5" fill="#e4e4e7" />
          <circle cx="369" cy="32" r="5" fill="#e4e4e7" />
          <circle cx="386" cy="32" r="5" fill="#e4e4e7" />
          <rect x="400" y="28" width="1" height="8" fill="#e4e4e7" rx="0.5" />
          <rect x="414" y="24" width="56" height="16" rx="8" fill="#3b82f6" />
          <text x="442" y="35" fill="white" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Export</text>
          <rect x="476" y="24" width="32" height="16" rx="8" fill="#e4e4e7" />
          <text x="492" y="35" fill="#71717a" fontSize="8" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">PNG</text>

          {/* Lanes */}
          <rect x="60" y="65" width="680" height="110" rx="6" fill="url(#lane-blue-g)" stroke="#3b82f6" strokeWidth="0.3" strokeOpacity="0.3" />
          <rect x="60" y="180" width="680" height="110" rx="6" fill="url(#lane-green-g)" stroke="#22c55e" strokeWidth="0.3" strokeOpacity="0.3" />
          <rect x="60" y="295" width="680" height="110" rx="6" fill="url(#lane-amber-g)" stroke="#f59e0b" strokeWidth="0.3" strokeOpacity="0.3" />

          {/* Lane labels */}
          <text x="76" y="86" fill="#2563eb" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">Customer</text>
          <text x="76" y="201" fill="#16a34a" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">Support Team</text>
          <text x="76" y="316" fill="#d97706" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">Engineering</text>

          {/* Nodes - Row 1 */}
          <NodePill x={160} y={105} label="Start" />
          <NodeRect x={280} y={100} label="Submit ticket" />
          <NodeDiamond x={450} y={118} label="Urgent?" />
          <NodeRect x={580} y={100} label="Track status" />

          {/* Nodes - Row 2 */}
          <NodeRect x={280} y={215} label="Triage request" />
          <NodeRect x={450} y={215} label="Assign agent" />
          <NodeRect x={620} y={215} label="Resolve ticket" />

          {/* Nodes - Row 3 */}
          <NodeRect x={350} y={330} label="Investigate bug" />
          <NodeRect x={530} y={330} label="Deploy fix" />
          <NodePill x={670} y={340} label="Done" />

          {/* Edges */}
          <EdgeLine x1={215} y1={118} x2={275} y2={118} />
          <EdgeLine x1={385} y1={118} x2={420} y2={118} />
          <EdgeLine x1={478} y1={118} x2={575} y2={118} />
          <EdgeLine x1={335} y1={135} x2={335} y2={210} />
          <EdgeLine x1={385} y1={233} x2={445} y2={233} />
          <EdgeLine x1={555} y1={233} x2={615} y2={233} />
          <EdgeLine x1={475} y1={145} x2={475} y2={210} />
          <EdgeLine x1={505} y1={250} x2={405} y2={325} />
          <EdgeLine x1={455} y1={348} x2={525} y2={348} />
          <EdgeLine x1={635} y1={348} x2={665} y2={348} />
          <EdgeLine x1={675} y1={250} x2={675} y2={335} />

          {/* Selection highlight */}
          <rect x={273} y={93} width="120" height="44" rx="10" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
          </rect>

          {/* Prompt bar */}
          <rect x="200" y="395" width="400" height="32" rx="16" fill="white" stroke="#e4e4e7" strokeWidth="0.5" />
          <text x="225" y="415" fill="#a1a1aa" fontSize="10" fontFamily="Inter, sans-serif">Describe your process...</text>
          <rect x="540" y="399" width="52" height="24" rx="12" fill="#3b82f6" />
          <text x="566" y="414" fill="white" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Generate</text>
        </svg>
      </div>
    </div>
  );
}

function NodePill({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={55} height={26} rx={13} fill="#1a1a1a" />
      <text x={x + 27.5} y={y + 16.5} fill="white" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">{label}</text>
    </g>
  );
}

function NodeRect({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={105} height={36} rx={8} fill="white" stroke="#e4e4e7" strokeWidth="0.75" />
      <text x={x + 52.5} y={y + 22} fill="#1a1a1a" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">{label}</text>
    </g>
  );
}

function NodeDiamond({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-20} y={-20} width={40} height={40} rx={4} fill="white" stroke="#e4e4e7" strokeWidth="0.75" transform="rotate(45)" />
      <text y={4} fill="#1a1a1a" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">{label}</text>
    </g>
  );
}

function EdgeLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="1" opacity="0.5" markerEnd="url(#h-arrow)" />;
}
