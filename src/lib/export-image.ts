import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import { download } from "./board-json";

const PAD = 40;

// Renders every node and edge (swimlane and free objects) to one image, regardless of the current zoom.
export async function exportImage(nodes: Node[], format: "png" | "pdf" | "svg", name: string, opts: { transparent?: boolean } = {}) {
  const viewport = document.querySelector<HTMLElement>(".react-flow__viewport");
  if (!viewport || !nodes.length) throw new Error("Nothing to export");

  const bounds = getNodesBounds(nodes);
  const width = Math.ceil(bounds.width + PAD * 2);
  const height = Math.ceil(bounds.height + PAD * 2);
  const { x, y } = getViewportForBounds(bounds, width, height, 1, 1, PAD / Math.max(width, height));

  const render = format === "svg" ? toSvg : toPng;
  const png = await render(viewport, {
    backgroundColor: opts.transparent && format !== "pdf" ? undefined : "#ffffff",
    width,
    height,
    pixelRatio: 2,
    style: { width: `${width}px`, height: `${height}px`, transform: `translate(${x}px, ${y}px) scale(1)` },
  });

  const file = name || "board";
  if (format !== "pdf") return download(png, `${file}.${format}`);

  // One page sized to the board, so nothing is split or scaled down.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: width > height ? "l" : "p", unit: "px", format: [width, height], hotfixes: ["px_scaling"] });
  pdf.addImage(png, "PNG", 0, 0, width, height);
  pdf.save(`${file}.pdf`);
}
