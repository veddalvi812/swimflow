"use client";

import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useNodesInitialized,
  ConnectionMode,
  MarkerType,
  type NodeChange,
  type EdgeChange,
  type OnNodesChange,
  type OnNodeDrag,
  type OnEdgesChange,
  type OnConnect,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Link from "next/link";
import { useDiagramStore } from "@/store/diagram-store";
import { ProcessNode } from "./nodes/ProcessNode";
import { DecisionNode } from "./nodes/DecisionNode";
import { StartEndNode } from "./nodes/StartEndNode";
import { SubprocessNode } from "./nodes/SubprocessNode";
import { LaneNode } from "./nodes/LaneNode";
import { Toolbar } from "./Toolbar";
import { RightPanel } from "./RightPanel";
import { ToolRail } from "./ToolRail";
import { DrawLayer } from "./DrawLayer";
import { SearchBox } from "./SearchBox";
import { AccountMenu } from "./AccountMenu";
import { RoutedEdge } from "./edges/RoutedEdge";
import { Cursors } from "./Cursors";
import { usePresence } from "@/store/presence";
import { useView, restoreView } from "@/store/view-store";
import { makeThumbnail } from "@/lib/export-image";
import { TOOL_KEYS } from "@/lib/hotkeys";
import { addImageFile } from "@/lib/images";
import { useUi } from "@/store/ui";
import { MakeWizard } from "./MakeWizard";
import { withToolbar } from "./nodes/withToolbar";
import { useAuth, displayName } from "@/hooks/use-auth";
import { StickyNode, TextNode, ShapeNode, FrameNode, KanbanNode, TimelineNode, TableNode, ImageNode, StampNode, LinkNode, PenNode } from "./nodes/FreeNodes";
import { useFreeStore, isFreeId, setAuthor } from "@/store/free-store";
import { undo, redo } from "@/store/history";
import { TooltipProvider } from "@/components/ui/tooltip";

const edgeTypes = { routed: RoutedEdge };

const ProcessBox = withToolbar(ProcessNode);

const nodeTypes = {
  process: ProcessBox,
  decision: withToolbar(DecisionNode),
  startEnd: withToolbar(StartEndNode),
  subprocess: withToolbar(SubprocessNode),
  delay: ProcessBox,
  document: ProcessBox,
  datastore: ProcessBox,
  lane: LaneNode,
  sticky: withToolbar(StickyNode),
  text: withToolbar(TextNode),
  shape: withToolbar(ShapeNode),
  frame: withToolbar(FrameNode),
  kanban: withToolbar(KanbanNode),
  timeline: withToolbar(TimelineNode),
  table: withToolbar(TableNode),
  image: withToolbar(ImageNode),
  stamp: withToolbar(StampNode),
  link: withToolbar(LinkNode),
  pen: withToolbar(PenNode),
};

function EditorCanvas({
  backHref,
  readOnly: viewOnly,
  shareSlot,
  onThumbnail,
}: {
  backHref: string;
  readOnly: boolean;
  shareSlot?: React.ReactNode;
  onThumbnail?: (make: () => Promise<string | null>) => void;
}) {
  const present = useView((v) => v.present);
  const background = useView((v) => v.background);
  const snap = useView((v) => v.snap);
  const minimap = useView((v) => v.minimap);
  const readOnly = viewOnly || present;
  useEffect(() => restoreView(), []);
  const { getNodes } = useReactFlow();
  useEffect(() => onThumbnail?.(() => makeThumbnail(getNodes())), [onThumbnail, getNodes]);
  const storeNodes = useDiagramStore((s) => s.nodes);
  const storeEdges = useDiagramStore((s) => s.edges);
  const selectNode = useDiagramStore((s) => s.selectNode);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const freeNodes = useFreeStore((s) => s.nodes);
  const freeEdges = useFreeStore((s) => s.edges);
  const tool = useFreeStore((s) => s.tool);
  const boardEmpty = useDiagramStore((s) => s.diagram.lanes.length === 0 && s.diagram.nodes.length === 0) && freeNodes.length === 0;
  const [welcomeClosed, setWelcomeClosed] = useState(false);
  const { user } = useAuth();
  useEffect(() => setAuthor(displayName(user)), [user]);

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Sync store nodes into local state when store changes (e.g. new diagram loaded)
  const prevStoreNodesRef = useRef(storeNodes);
  if (storeNodes !== prevStoreNodesRef.current) {
    prevStoreNodesRef.current = storeNodes;
    setNodes(storeNodes);
  }
  const prevStoreEdgesRef = useRef(storeEdges);
  if (storeEdges !== prevStoreEdgesRef.current) {
    prevStoreEdgesRef.current = storeEdges;
    setEdges(storeEdges);
  }

  // Fit view when nodes are initialized or diagram changes
  const nodesInitialized = useNodesInitialized();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (nodesInitialized && !hasFittedRef.current) {
      hasFittedRef.current = true;
      fitView({ padding: 0.1 });
    }
  }, [nodesInitialized, fitView]);

  // Re-fit when a new diagram is loaded from prompt bar
  const prevStoreRef2 = useRef(storeNodes);
  useEffect(() => {
    if (storeNodes !== prevStoreRef2.current && hasFittedRef.current) {
      prevStoreRef2.current = storeNodes;
      hasFittedRef.current = false;
    }
  }, [storeNodes]);

  // Swimlane objects stay in local state; free-form objects (ids "f-…"/"fe-…") live in the free store.
  const allNodes = useMemo(() => [...nodes, ...freeNodes], [nodes, freeNodes]);
  const allEdges = useMemo(
    () => [
      ...edges,
      ...freeEdges.map((e) => {
        const d = (e.data ?? {}) as { arrow?: string; dashed?: boolean; color?: string };
        const color = d.color ?? "#71717a";
        const head = { type: MarkerType.ArrowClosed, color };
        return {
          ...e,
          type: e.type ?? "smoothstep",
          markerEnd: d.arrow === "none" ? undefined : head,
          markerStart: d.arrow === "both" ? head : undefined,
          style: { stroke: color, strokeWidth: 2, strokeDasharray: d.dashed ? "6 4" : undefined },
          labelStyle: { fontSize: 12, fontWeight: 500, fill: "#1a1a1a" },
          reconnectable: true,
        };
      }),
    ],
    [edges, freeEdges]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const free: NodeChange[] = [];
      const rest: NodeChange[] = [];
      for (const c of changes) (isFreeId("id" in c ? c.id : c.item.id) ? free : rest).push(c);
      if (free.length) useFreeStore.getState().applyNodeChanges(free);
      if (rest.length) onNodesChange(rest);
    },
    [onNodesChange]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const free: EdgeChange[] = [];
      const rest: EdgeChange[] = [];
      for (const c of changes) (("id" in c ? c.id : c.item.id).startsWith("fe-") ? free : rest).push(c);
      if (free.length) useFreeStore.getState().applyEdgeChanges(free);
      if (rest.length) onEdgesChange(rest);
    },
    [onEdgesChange]
  );

  // Places the armed tool's object at the click; returns true if it did.
  const placeTool = useCallback(
    (e: React.MouseEvent) => {
      const { tool: armed, place } = useFreeStore.getState();
      if (!armed) return false;
      place(screenToFlowPosition({ x: e.clientX, y: e.clientY }));
      return true;
    },
    [screenToFlowPosition]
  );

  const selectEdge = useDiagramStore((s) => s.selectEdge);
  const setEditingNode = useDiagramStore((s) => s.setEditingNode);

  const handleNodeClick = useCallback(
    (e: React.MouseEvent, node: { id: string }) => {
      if (placeTool(e)) return;
      if (isFreeId(node.id)) selectNode(null);
      else if (!node.id.startsWith("lane-")) selectNode(node.id);
    },
    [selectNode, placeTool]
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      if (!node.id.startsWith("lane-") && !isFreeId(node.id)) {
        setEditingNode(node.id);
      }
    },
    [setEditingNode]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  // Dropping a swimlane step remembers its spot and moves it into the lane it landed in.
  const handleNodeDragStop = useCallback<OnNodeDrag>((_, __, dragged) => {
    for (const n of dragged) {
      if (!isFreeId(n.id) && !n.id.startsWith("lane-")) useDiagramStore.getState().moveStep(n.id, n.position);
    }
  }, []);

  // Double-click empty space inside a lane to add a step there.
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly || !(e.target as HTMLElement).closest(".react-flow__pane")) return;
      const { lanes, diagram, addNode } = useDiagramStore.getState();
      if (!lanes.length) return;
      const at = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const vertical = diagram.orientation === "vertical";
      const lane = lanes.find((l) =>
        vertical ? at.x >= l.x && at.x < l.x + l.width && at.y >= l.y && at.y < l.y + l.height : at.y >= l.y && at.y < l.y + l.height && at.x >= l.x && at.x < l.x + l.width
      );
      if (lane) addNode(lane.id, "process", at);
    },
    [readOnly, screenToFlowPosition]
  );

  const handlePaneClick = useCallback(
    (e: React.MouseEvent) => {
      if (placeTool(e)) return;
      selectNode(null);
      setEditingNode(null);
    },
    [selectNode, setEditingNode, placeTool]
  );

  const router = useRouter();

  // Paste an image from the clipboard onto the canvas.
  useEffect(() => {
    if (readOnly) return;
    const onPaste = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (!files.length) return;
      e.preventDefault();
      const at = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      files.forEach((f) => addImageFile(f, at));
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [readOnly, screenToFlowPosition]);

  // Drag a tool from the rail, or an image file from your computer, onto the canvas.
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      const at = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const toolName = e.dataTransfer.getData("application/x-swimflow-tool");
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
      if (toolName) {
        e.preventDefault();
        const free = useFreeStore.getState();
        free.setTool(toolName as never);
        free.place(at);
      } else if (files.length) {
        e.preventDefault();
        files.forEach((f, i) => addImageFile(f, { x: at.x + i * 24, y: at.y + i * 24 }));
      }
    },
    [readOnly, screenToFlowPosition]
  );

  const addEdgeAction = useDiagramStore((s) => s.addEdge);
  const deleteNode = useDiagramStore((s) => s.deleteNode);
  const deleteEdge = useDiagramStore((s) => s.deleteEdge);

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      if (isFreeId(connection.source) || isFreeId(connection.target)) useFreeStore.getState().connect(connection);
      else addEdgeAction(connection.source, connection.target);
    },
    [addEdgeAction]
  );

  useEffect(() => {
    if (!present) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && useView.getState().set({ present: false });
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [present]);

  useEffect(() => {
    if (readOnly) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Escape") {
        useView.getState().set({ present: false });
        useFreeStore.getState().setTool(null);
        useUi.setState({ shortcuts: false, searching: false });
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (e.key === "?") useUi.setState((u) => ({ shortcuts: !u.shortcuts }));
        else if (!e.shiftKey && key in TOOL_KEYS) useFreeStore.getState().setTool(TOOL_KEYS[key]);
        else if (e.shiftKey && e.code === "Digit1") fitView({ padding: 0.1, duration: 250 });
        else if (e.shiftKey && e.code === "Digit2") {
          const sel = useFreeStore.getState().nodes.filter((n) => n.selected);
          if (sel.length) fitView({ nodes: sel, padding: 0.3, duration: 250 });
        } else if (e.key.startsWith("Arrow")) {
          const step = e.shiftKey ? 10 : 1;
          const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          if (useFreeStore.getState().nodes.some((n) => n.selected)) {
            e.preventDefault();
            useFreeStore.getState().nudge(dx, dy);
          }
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        useFreeStore.getState().selectAll();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        useUi.setState({ searching: true });
      }
      if (e.ctrlKey || e.metaKey) {
        const free = useFreeStore.getState();
        if (e.key === "c") free.copy();
        if (e.key === "v") free.paste();
        if (e.key === "d") { e.preventDefault(); free.copy(); free.paste(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedNodeId, selectedEdgeId, selectedLaneId, editingNodeId } = useDiagramStore.getState();
        if (editingNodeId) return;
        if (selectedNodeId) { e.preventDefault(); deleteNode(selectedNodeId); }
        else if (selectedEdgeId) { e.preventDefault(); deleteEdge(selectedEdgeId); }
        else if (selectedLaneId) { e.preventDefault(); useDiagramStore.getState().deleteLane(selectedLaneId); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteNode, deleteEdge, readOnly, fitView]);

  return (
    <div onDoubleClick={handleDoubleClick}
      onMouseMove={(e) => {
        const send = usePresence.getState().sendCursor;
        if (send) {
          const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
          send(p.x, p.y);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`${tool ? "tool-armed" : ""} ${readOnly ? "readonly" : ""}`} style={{ position: "relative", width: "100vw", height: "100vh", background: "var(--background)" }}>
      <ReactFlow
        nodes={allNodes}
        edges={allEdges}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        deleteKeyCode={readOnly ? null : "Backspace"}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeDragStop={handleNodeDragStop}
        zoomOnDoubleClick={false}
        snapToGrid={snap}
        snapGrid={[12, 12]}
        onConnect={handleConnect}
        onReconnect={(old, conn) => old.id.startsWith("fe-") && useFreeStore.getState().reconnect(old.id, conn)}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        {background !== "blank" && (
          <Background
            variant={background === "lines" ? BackgroundVariant.Lines : BackgroundVariant.Dots}
            gap={background === "lines" ? 40 : 24}
            size={background === "lines" ? 1 : 1.8}
            color={background === "lines" ? "#ececef" : "#d4d4d8"}
          />
        )}

        {minimap && (
        <MiniMap
          position="bottom-right"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
          maskColor="rgba(0,0,0,0.1)"
          nodeStrokeWidth={2}
        />
        )}

        <Panel position="top-left" className="pointer-events-auto flex items-center gap-2">
          <Link
            href={backHref}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--surface)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="5" rx="1.5" fill="#60a5fa" /><rect x="3" y="10" width="18" height="5" rx="1.5" fill="#60a5fa" opacity="0.6" /><rect x="3" y="17" width="18" height="4" rx="1.5" fill="#60a5fa" opacity="0.3" /></svg>
            SwimFlow
          </Link>
          {!readOnly && <AccountMenu />}
        </Panel>

        <Cursors />

        {!readOnly && <DrawLayer />}

        <Panel position="top-center" className="pointer-events-none mt-14">
          <SearchBox />
        </Panel>

        {readOnly ? (
          <Panel position="top-center" className="pointer-events-none">
            {present ? (
              <button
                onClick={() => useView.getState().set({ present: false })}
                className="pointer-events-auto rounded-full bg-[#1a1a1a]/85 px-3 py-1 text-xs text-white shadow-sm hover:bg-[#1a1a1a]"
              >
                Presenting. Press Esc or click to exit
              </button>
            ) : (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1 text-xs text-[var(--muted-foreground)] shadow-sm">
                View only
              </span>
            )}
          </Panel>
        ) : (
          <>
            <Panel position="top-center" className="pointer-events-none">
              <Toolbar onCloud={() => router.push("/dashboard")} extra={shareSlot} />
            </Panel>

            <Panel position="top-right" className="pointer-events-none mt-14">
              <RightPanel />
            </Panel>

            <Panel position="center-left" className="pointer-events-none">
              <ToolRail />
            </Panel>

          </>
        )}
      </ReactFlow>

      {boardEmpty && !readOnly && !welcomeClosed && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-xl">
            <MakeWizard onBlank={() => setWelcomeClosed(true)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Editor({
  backHref = "/",
  readOnly = false,
  shareSlot,
  onThumbnail,
}: {
  backHref?: string;
  readOnly?: boolean;
  shareSlot?: React.ReactNode;
  onThumbnail?: (make: () => Promise<string | null>) => void;
}) {
  return (
    <TooltipProvider delay={300}>
      <ReactFlowProvider>
        <EditorCanvas backHref={backHref} readOnly={readOnly} shareSlot={shareSlot} onThumbnail={onThumbnail} />
      </ReactFlowProvider>
    </TooltipProvider>
  );
}
