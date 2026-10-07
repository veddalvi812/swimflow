"use client";

import { useCallback, useRef, useEffect } from "react";
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
  type OnNodesChange,
  type OnEdgesChange,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useDiagramStore } from "@/store/diagram-store";
import { ProcessNode } from "./nodes/ProcessNode";
import { DecisionNode } from "./nodes/DecisionNode";
import { StartEndNode } from "./nodes/StartEndNode";
import { SubprocessNode } from "./nodes/SubprocessNode";
import { LaneNode } from "./nodes/LaneNode";
import { Toolbar } from "./Toolbar";
import { PromptBar } from "./PromptBar";
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
};

function EditorCanvas() {
  const storeNodes = useDiagramStore((s) => s.nodes);
  const storeEdges = useDiagramStore((s) => s.edges);
  const selectNode = useDiagramStore((s) => s.selectNode);
  const { fitView } = useReactFlow();

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

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      if (!node.id.startsWith("lane-")) {
        selectNode(node.id);
      }
    },
    [selectNode]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "var(--canvas-bg)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--canvas-grid)" />

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

        <Panel position="top-center" className="pointer-events-none">
          <Toolbar />
        </Panel>

        <Panel position="bottom-center" className="pointer-events-none mb-4 flex w-full justify-center px-4">
          <PromptBar />
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function Editor() {
  return (
    <TooltipProvider delay={300}>
      <ReactFlowProvider>
        <EditorCanvas />
      </ReactFlowProvider>
    </TooltipProvider>
  );
}
