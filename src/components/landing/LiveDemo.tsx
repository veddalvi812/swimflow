"use client";

import { useState, useCallback } from "react";
import { ScrollReveal } from "./ScrollReveal";

const SAMPLE_RESULT = {
  title: "Order Fulfillment",
  lanes: [
    { id: "lane-1", label: "Customer" },
    { id: "lane-2", label: "Warehouse" },
    { id: "lane-3", label: "Shipping" },
  ],
  nodes: [
    { id: "n1", label: "Place order", lane: "lane-1" },
    { id: "n2", label: "Confirm payment", lane: "lane-1" },
    { id: "n3", label: "Pick items", lane: "lane-2" },
    { id: "n4", label: "Pack order", lane: "lane-2" },
    { id: "n5", label: "Ship package", lane: "lane-3" },
    { id: "n6", label: "Deliver", lane: "lane-3" },
  ],
};

const laneColors = ["#3b82f6", "#22c55e", "#f59e0b"];

export function LiveDemo() {
  const [input, setInput] = useState("Customer places an order, warehouse picks and packs items, shipping delivers the package");
  const [showResult, setShowResult] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleGenerate = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setShowResult(false);
    setTimeout(() => {
      setShowResult(true);
      setAnimating(false);
    }, 800);
  }, [animating]);

  return (
    <div className="mt-12">
      <ScrollReveal delay={100}>
        {/* Input area */}
        <div className="rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-5">
          <label className="mb-2 block text-sm font-medium text-[#71717a]">Process description</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-lg border border-[#e4e4e7] bg-white px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#a1a1aa] outline-none transition-colors focus:border-[#3b82f6]"
              placeholder="Describe your process..."
            />
            <button
              onClick={handleGenerate}
              disabled={animating}
              className="shrink-0 rounded-full bg-[#3b82f6] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#2563eb] disabled:opacity-50"
            >
              {animating ? "Generating..." : "Try it"}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className={`mt-4 grid gap-4 transition-all duration-500 lg:grid-cols-2 ${showResult ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {/* JSON output */}
          <div className="rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-5">
            <p className="mb-3 text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">JSON Output</p>
            <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-[#52525b]">
              {JSON.stringify(SAMPLE_RESULT, null, 2)}
            </pre>
          </div>

          {/* Visual preview */}
          <div className="rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-5">
            <p className="mb-3 text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Diagram Preview</p>
            <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <rect width="400" height="260" fill="#fafafa" rx="6" />
              {/* Lanes */}
              {SAMPLE_RESULT.lanes.map((lane, i) => (
                <g key={lane.id}>
                  <rect x="10" y={10 + i * 82} width="380" height="76" rx="4" fill={laneColors[i]} fillOpacity="0.07" stroke={laneColors[i]} strokeWidth="0.3" strokeOpacity="0.3" />
                  <text x="22" y={30 + i * 82} fill={laneColors[i]} fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">{lane.label}</text>
                </g>
              ))}
              {/* Nodes */}
              {SAMPLE_RESULT.nodes.map((node, i) => {
                const laneIdx = SAMPLE_RESULT.lanes.findIndex(l => l.id === node.lane);
                const col = laneIdx === 0 ? i : i - (laneIdx === 1 ? 2 : 4);
                const x = 60 + col * 150;
                const y = 40 + laneIdx * 82;
                return (
                  <g key={node.id}>
                    <rect x={x} y={y} width={110} height={30} rx={6} fill="white" stroke="#e4e4e7" strokeWidth="0.5">
                      <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${0.1 + i * 0.1}s`} fill="freeze" />
                    </rect>
                    <text x={x + 55} y={y + 19} fill="#1a1a1a" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">
                      {node.label}
                    </text>
                  </g>
                );
              })}
              {/* Connecting lines */}
              <line x1="170" y1="55" x2="205" y2="55" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
              <line x1="170" y1="55" x2="115" y2="122" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
              <line x1="170" y1="122" x2="205" y2="122" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
              <line x1="270" y1="122" x2="115" y2="204" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
              <line x1="170" y1="204" x2="205" y2="204" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
            </svg>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
