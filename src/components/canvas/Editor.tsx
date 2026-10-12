"use client";

import { useCallback, useMemo, useRef, useEffect } from "react";
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
import { PromptBar } from "./PromptBar";
import { RightPanel } from "./RightPanel";
import { ToolRail } from "./ToolRail";
import { StickyNode, TextNode, ShapeNode, FrameNode, KanbanNode, TimelineNode, TableNode } from "./nodes/FreeNodes";
import { useFreeStore, isFreeId } from "@/store/free-store";
import { undo, redo } from "@/store/history";
import { TooltipProvider } from "@/components/ui/tooltip";

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
  subprocess: SubprocessNode,
  delay: ProcessNode,
  document: ProcessNode,
  datastore: ProcessNode,
  lane: LaneNode,
  sticky: StickyNode,
  text: TextNode,
  shape: ShapeNode,
  frame: FrameNode,
  kanban: KanbanNode,
  timeline: TimelineNode,
  table: TableNode,
};

function EditorCanvas({ backHref }: { backHref: string }) {
  const storeNodes = useDiagramStore((s) => s.nodes);
  const storeEdges = useDiagramStore((s) => s.edges);
  const selectNode = useDiagramStore((s) => s.selectNode);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const freeNodes = useFreeStore((s) => s.nodes);
  const freeEdges = useFreeStore((s) => s.edges);
  const tool = useFreeStore((s) => s.tool);

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
    () => [...edges, ...freeEdges.map((e) => ({ ...e, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed } }))],
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

  const handlePaneClick = useCallback(
    (e: React.MouseEvent) => {
      if (placeTool(e)) return;
      selectNode(null);
      setEditingNode(null);
    },
    [selectNode, setEditingNode, placeTool]
  );

  const router = useRouter();

  const addEdgeAction = useDiagramStore((s) => s.addEdge);
  const deleteNode = useDiagramStore((s) => s.deleteNode);
  const deleteEdge = useDiagramStore((s) => s.deleteEdge);

  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.source || !connection.target) return;
      if (isFreeId(connection.source) && isFreeId(connection.target)) useFreeStore.getState().connect(connection);
      else if (!isFreeId(connection.source) && !isFreeId(connection.target)) {
        addEdgeAction(connection.source, connection.target);
      }
    },
    [addEdgeAction]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Escape") useFreeStore.getState().setTool(null);
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
        const { selectedNodeId, selectedEdgeId, editingNodeId } = useDiagramStore.getState();
        if (editingNodeId) return;
        if (selectedNodeId) { e.preventDefault(); deleteNode(selectedNodeId); }
        else if (selectedEdgeId) { e.preventDefault(); deleteEdge(selectedEdgeId); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteNode, deleteEdge]);

  return (
    <div className={tool ? "tool-armed" : ""} style={{ width: "100vw", height: "100vh", background: "var(--background)" }}>
      <ReactFlow
        nodes={allNodes}
        edges={allEdges}
        connectionMode={ConnectionMode.Loose}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onConnect={handleConnect}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.8} color="#d4d4d8" />

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

        <Panel position="top-left" className="pointer-events-auto">
          <Link
            href={backHref}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--surface)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="5" rx="1.5" fill="#60a5fa" /><rect x="3" y="10" width="18" height="5" rx="1.5" fill="#60a5fa" opacity="0.6" /><rect x="3" y="17" width="18" height="4" rx="1.5" fill="#60a5fa" opacity="0.3" /></svg>
            SwimFlow
          </Link>
        </Panel>

        <Panel position="top-center" className="pointer-events-none">
          <Toolbar onCloud={() => router.push("/dashboard")} />
        </Panel>

        <Panel position="top-right" className="pointer-events-none mt-14">
          <RightPanel />
        </Panel>

        <Panel position="center-left" className="pointer-events-none">
          <ToolRail />
        </Panel>

        <Panel position="bottom-center" className="pointer-events-none mb-4 flex w-full justify-center px-4">
          <PromptBar />
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function Editor({ backHref = "/" }: { backHref?: string }) {
  return (
    <TooltipProvider delay={300}>
      <ReactFlowProvider>
        <EditorCanvas backHref={backHref} />
      </ReactFlowProvider>
    </TooltipProvider>
  );
}
