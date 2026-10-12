"use client";

import { useEffect, useRef } from "react";

export function DiagramHero() {
  const pathRefs = useRef<SVGPathElement[]>([]);

  useEffect(() => {
    pathRefs.current.forEach((path, i) => {
      if (!path) return;
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.animate(
        [{ strokeDashoffset: `${length}` }, { strokeDashoffset: "0" }],
        { duration: 600, delay: 800 + i * 150, fill: "forwards", easing: "ease-out" }
      );
    });
  }, []);

  const addPathRef = (el: SVGPathElement | null, i: number) => {
    if (el) pathRefs.current[i] = el;
  };

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 opacity-60" />
      <div className="relative rounded-xl border border-[var(--border)] bg-white p-3 shadow-xl shadow-black/[0.04]">
        <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          {/* Dot grid */}
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="0.6" fill="#d4d4d8" opacity="0.4" />
            </pattern>
            <marker id="hero-arrow" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
              <path d="M0,0 L7,2.5 L0,5" fill="#2563eb" />
            </marker>
          </defs>
          <rect width="480" height="340" fill="#fafafa" rx="6" />
          <rect width="480" height="340" fill="url(#hero-dots)" rx="6" />

          {/* Lanes */}
          <g opacity="0.95">
            <rect x="32" y="44" width="416" height="82" rx="4" fill="#dbeafe" fillOpacity="0.4" stroke="#93c5fd" strokeWidth="0.5" />
            <rect x="32" y="130" width="416" height="82" rx="4" fill="#dcfce7" fillOpacity="0.4" stroke="#86efac" strokeWidth="0.5" />
            <rect x="32" y="216" width="416" height="82" rx="4" fill="#fef3c7" fillOpacity="0.4" stroke="#fcd34d" strokeWidth="0.5" />
          </g>

          {/* Lane labels */}
          <text x="44" y="62" fill="#1e40af" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">User</text>
          <text x="44" y="148" fill="#166534" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">System</text>
          <text x="44" y="234" fill="#92400e" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif" opacity="0.8">Database</text>

          {/* Animated edges */}
          <path ref={(el) => addPathRef(el, 0)} d="M140,85 L190,85" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#hero-arrow)" opacity="0.7" />
          <path ref={(el) => addPathRef(el, 1)} d="M290,85 L340,85" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#hero-arrow)" opacity="0.7" />
          <path ref={(el) => addPathRef(el, 2)} d="M240,99 L240,155" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#hero-arrow)" opacity="0.7" />
          <path ref={(el) => addPathRef(el, 3)} d="M290,171 L340,171" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#hero-arrow)" opacity="0.7" />
          <path ref={(el) => addPathRef(el, 4)} d="M390,185 L390,243" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#hero-arrow)" opacity="0.7" />
          <path ref={(el) => addPathRef(el, 5)} d="M340,257 L290,257" stroke="#2563eb" strokeWidth="1.5" markerEnd="url(#hero-arrow)" opacity="0.7" />

          {/* Start node */}
          <rect x="80" y="72" width="60" height="26" rx="13" fill="#09090b">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.2s" fill="freeze" />
          </rect>
          <text x="110" y="89" fill="white" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">Start</text>

          {/* Process: User requests */}
          <rect x="195" y="70" width="90" height="30" rx="6" fill="white" stroke="#e4e4e7" strokeWidth="0.75">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.35s" fill="freeze" />
          </rect>
          <text x="240" y="89" fill="#09090b" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Submit form</text>

          {/* Decision */}
          <g transform="translate(370, 85)">
            <rect x="-18" y="-18" width="36" height="36" rx="3" fill="white" stroke="#e4e4e7" strokeWidth="0.75" transform="rotate(45)">
              <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.5s" fill="freeze" />
            </rect>
            <text y="3" fill="#09090b" fontSize="8" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Valid?</text>
          </g>

          {/* Process: System validates */}
          <rect x="195" y="156" width="90" height="30" rx="6" fill="white" stroke="#e4e4e7" strokeWidth="0.75">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.55s" fill="freeze" />
          </rect>
          <text x="240" y="175" fill="#09090b" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Validate</text>

          {/* Process: System processes */}
          <rect x="345" y="156" width="90" height="30" rx="6" fill="white" stroke="#e4e4e7" strokeWidth="0.75">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.65s" fill="freeze" />
          </rect>
          <text x="390" y="175" fill="#09090b" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Process</text>

          {/* Process: DB Save */}
          <rect x="345" y="243" width="90" height="30" rx="6" fill="white" stroke="#e4e4e7" strokeWidth="0.75">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.75s" fill="freeze" />
          </rect>
          <text x="390" y="262" fill="#09090b" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif" textAnchor="middle">Save record</text>

          {/* End node */}
          <rect x="220" y="243" width="60" height="26" rx="13" fill="#09090b">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.85s" fill="freeze" />
          </rect>
          <text x="250" y="260" fill="white" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif" textAnchor="middle">Done</text>

          {/* Selection ring on one node */}
          <rect x="193" y="68" width="94" height="34" rx="8" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.3">
            <animate attributeName="opacity" values="0;0.3;0" dur="3s" begin="2s" repeatCount="indefinite" />
          </rect>
        </svg>
      </div>
    </div>
  );
}
