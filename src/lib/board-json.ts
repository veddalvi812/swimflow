import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore, snapshotOf } from "@/store/free-store";

// The whole board as JSON: the swimlane diagram plus the free-form objects under `free`.
export function boardJSON() {
  const { nodes, edges } = useFreeStore.getState();
  return JSON.stringify({ ...useDiagramStore.getState().diagram, free: snapshotOf(nodes, edges) }, null, 2);
}

// Throws with a readable message if the text isn't a board. Accepts a markdown-fenced paste.
export function applyBoardJSON(text: string) {
  const raw = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const { free, ...d } = JSON.parse(raw);
  if (!d.lanes || !d.nodes || !d.edges) throw new Error("Needs lanes, nodes and edges");
  useDiagramStore.getState().setDiagram(d);
  useFreeStore.getState().replace(free);
}

export function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadText(text: string, filename: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  download(url, filename);
  URL.revokeObjectURL(url);
}
