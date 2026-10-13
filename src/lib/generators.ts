import { useDiagramStore } from "@/store/diagram-store";
import { useFreeStore, uid, type KanbanCol, type Tool } from "@/store/free-store";
import { FLOW_PROMPT, parseFlow } from "@/lib/flowchart";
import { LANE_COLORS } from "@/lib/constants";
import type { SwimlaneDiagram } from "@/types/diagram";

type Pos = { x: number; y: number };
type Json = Record<string, unknown>;

const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const arr = (v: unknown): Json[] => (Array.isArray(v) ? (v as Json[]) : []);
const parse = (text: string): Json => JSON.parse(text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, ""));
const fill = (template: string, desc: string) => template.replace(/\{describe[^}]*\}/, desc.trim());

// A smart block whose data comes from AI JSON: prompt, the list key it needs, and a normalizer.
export const BLOCK_SPECS: Record<string, { label: string; prompt: string; key: string; replace: string; normalize: (p: Json) => Json }> = {
  kanban: {
    label: "Kanban board",
    key: "columns",
    replace: "Replace columns",
    prompt: `Generate a kanban board as JSON for: "{describe your project}"

Return only this structure:
{
  "title": "...",
  "columns": [
    { "id": "col-1", "title": "To do",
      "cards": [ { "id": "c1", "text": "..." } ] }
  ]
}`,
    normalize: (p) => ({
      columns: arr(p.columns).map((c): KanbanCol => ({
        id: str(c.id, uid()),
        title: str(c.title, "Column"),
        cards: arr(c.cards).map((k) => ({ id: str(k.id, uid()), text: str(k.text) })),
      })),
    }),
  },
  timeline: {
    label: "Timeline",
    key: "items",
    replace: "Replace items",
    prompt: `Generate a timeline as JSON for: "{describe your project}"

Return only this structure, in chronological order:
{
  "title": "...",
  "items": [
    { "id": "t1", "date": "Jan 2025", "text": "..." }
  ]
}`,
    normalize: (p) => ({
      items: arr(p.items).map((i) => ({ id: str(i.id, uid()), date: str(i.date), text: str(i.text) })),
    }),
  },
  table: {
    label: "Table",
    key: "rows",
    replace: "Replace table",
    prompt: `Generate a table as JSON for: "{describe what it should contain}"

Return only this structure:
{
  "title": "...",
  "headers": ["Column A", "Column B"],
  "rows": [
    ["cell", "cell"]
  ]
}`,
    normalize: (p) => {
      const headers = (Array.isArray(p.headers) ? p.headers : []).map((h) => str(h));
      const rows = (Array.isArray(p.rows) ? (p.rows as unknown[][]) : []).map((r) =>
        headers.map((_, i) => str(Array.isArray(r) ? r[i] : "")),
      );
      return { headers: headers.length ? headers : ["Column"], rows };
    },
  },
};

const SWIMLANE_PROMPT = `You are a swimlane diagram generator. Given a process description, output ONLY valid JSON matching this schema. No markdown, no explanation.

Schema:
{
  "title": "string",
  "orientation": "horizontal",
  "lanes": [{ "id": "string", "label": "string", "color": "string (hex)" }],
  "nodes": [{ "id": "string", "type": "start|end|process|decision|subprocess", "label": "string", "lane": "string (lane id)" }],
  "edges": [{ "id": "string", "from": "string (node id)", "to": "string (node id)", "label": "string (optional)", "type": "default|conditional" }]
}

Rules:
- Every diagram must have exactly one "start" node and at least one "end" node
- Decision nodes must have at least 2 outgoing edges with labels (e.g. "Yes"/"No")
- Every node's "lane" must reference a valid lane id
- Edge "from"/"to" must reference valid node ids
- Use lowercase-kebab-case for all ids
- Assign distinct hex colors to lanes from: #3b82f6, #22c55e, #f59e0b, #ef4444, #a855f7, #06b6d4, #f97316, #64748b

Process to diagram:
{describe your process}`;

export type GeneratorId = "swimlane" | "flowchart" | "kanban" | "timeline" | "table";

export interface Generator {
  id: GeneratorId;
  label: string;
  noun: string; // "Tell me about your ___"
  blurb: string;
  placeholder: string;
  prompt: (description: string) => string;
  build: (text: string, pos: Pos) => void; // throws on bad input
  starter: (pos: Pos) => void;
}

const armed = (tool: Tool) => (pos: Pos) => {
  const s = useFreeStore.getState();
  s.setTool(tool);
  s.place(pos);
};

const block = (id: "kanban" | "timeline" | "table", noun: string, blurb: string, placeholder: string): Generator => {
  const spec = BLOCK_SPECS[id];
  return {
    id,
    label: spec.label,
    noun,
    blurb,
    placeholder,
    prompt: (d) => fill(spec.prompt, d),
    build: (text, pos) => {
      const p = parse(text);
      if (!Array.isArray(p[spec.key])) throw new Error(`Missing the "${spec.key}" list`);
      useFreeStore.getState().addBlock(id, { title: str(p.title, spec.label), ...spec.normalize(p) }, pos);
    },
    starter: armed(id),
  };
};

export const GENERATORS: Generator[] = [
  {
    id: "swimlane",
    label: "Process with swimlanes",
    noun: "process",
    blurb: "Who does what, step by step",
    placeholder: "A customer places an order, the warehouse packs it, and a courier delivers it",
    prompt: (d) => fill(SWIMLANE_PROMPT, d),
    build: (text) => {
      const p = parse(text) as unknown as SwimlaneDiagram;
      if (!p.lanes || !p.nodes || !p.edges) throw new Error("Missing lanes, nodes, or edges");
      useDiagramStore.getState().setDiagram(p);
    },
    starter: () =>
      useDiagramStore.getState().setDiagram({
        title: "New process",
        orientation: "horizontal",
        lanes: [0, 1, 2].map((i) => ({ id: `lane-${i + 1}`, label: `Lane ${i + 1}`, color: LANE_COLORS[i] })),
        nodes: [],
        edges: [],
      }),
  },
  {
    id: "flowchart",
    label: "Flowchart",
    noun: "flow",
    blurb: "Decisions and what happens next",
    placeholder: "Check if the item is in stock. If yes, ship it. If not, offer a backorder",
    prompt: (d) => fill(FLOW_PROMPT, d),
    build: (text, pos) => useFreeStore.getState().addFlowchart(parseFlow(text), pos),
    starter: armed("flowchart"),
  },
  block("kanban", "project", "Track work across columns", "Website redesign: research, design, build, and launch"),
  block("timeline", "plan", "Milestones, in order", "A product launch from kickoff in January to public release in June"),
  block("table", "table", "Rows and columns, fast", "Compare three project tools by price, best for, and free plan"),
];
