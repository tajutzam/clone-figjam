import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom"; // Untuk mengambil ID dari URL
import ReactFlow, {
    Controls,
    Background,
    Connection,
    addEdge,
    ConnectionMode,
    SelectionMode,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
    ReactFlowProvider,
} from "reactflow";
import * as Toolbar from "@radix-ui/react-toolbar";
import * as Tooltip from "@radix-ui/react-tooltip";

import {
    RoomProvider,
    useStorage,
    useMutation,
    useMyPresence,
    useOthers
} from "../../liveblocks.config";
import { LiveList, LiveObject } from "@liveblocks/client";

import { Default } from "../Edges/Default";
import { Square } from "../Nodes/Square";
import { Circle } from "../Nodes/Circle";
import { Triangle } from "../Nodes/Triangle";
import { TableNode } from "../Nodes/Table";
import { StickyNode } from "../Nodes/Sticky";
import { DiamondNode } from "../Nodes/Diamond";

import "reactflow/dist/style.css";

const dotColor = "#E6E6E6";

const NODE_TYPES = {
    square: Square,
    circle: Circle,
    triangle: Triangle,
    table: TableNode,
    sticky: StickyNode,
    diamond: DiamondNode,
};

const EDGE_TYPES = {
    default: Default,
};

type nodeTypes = keyof typeof NODE_TYPES;

function CollaborativeCanvas() {
    const nodes = useStorage((root) => root.nodes);
    const edges = useStorage((root) => root.edges);

    const [myPresence, updateMyPresence] = useMyPresence();
    const others = useOthers();


    const onNodesChange = useMutation(({ storage }, changes: NodeChange[]) => {
        const liveNodes = storage.get("nodes");
        const nextNodes = applyNodeChanges(changes, [...liveNodes.toImmutable()]);

        nextNodes.forEach((node, index) => {
            liveNodes.get(index)?.update(node);
        });
    }, []);

    const onEdgesChange = useMutation(({ storage }, changes: EdgeChange[]) => {
        const liveEdges = storage.get("edges");
        const nextEdges = applyEdgeChanges(changes, [...liveEdges.toImmutable()]);

        nextEdges.forEach((edge, index) => {
            liveEdges.get(index)?.update(edge);
        });
    }, []);

    const onConnect = useMutation(({ storage }, connection: Connection) => {
        const liveEdges = storage.get("edges");
        const nextEdges = addEdge(connection, [...liveEdges.toImmutable()]);
        const lastEdge = nextEdges[nextEdges.length - 1];

        if (lastEdge) {
            liveEdges.push(new LiveObject(lastEdge as any));
        }
    }, []);

    const handleAddNode = useMutation(({ storage }, type: nodeTypes) => {
        const liveNodes = storage.get("nodes");
        const position = {
            x: window.innerWidth / 2 - 64,
            y: window.innerHeight / 2 - 64
        };

        liveNodes.push(new LiveObject({
            id: crypto.randomUUID(),
            type,
            position,
            data: { label: "" },
        } as any));
    }, []);

    const selectAll = useMutation(({ storage }) => {
        const liveNodes = storage.get("nodes");
        liveNodes.forEach((node) => {
            node.update({ selected: true });
        });
    }, []);

    // --- KEYBOARD & MOUSE EVENTS ---

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "a") {
                event.preventDefault();
                selectAll();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectAll]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        updateMyPresence({
            cursor: { x: Math.floor(e.clientX), y: Math.floor(e.clientY) }
        });
    }, [updateMyPresence]);

    const onPointerLeave = useCallback(() => {
        updateMyPresence({ cursor: null });
    }, [updateMyPresence]);

    // Loading State: Sangat penting agar tidak error "Storage not loaded"
    if (nodes === null || edges === null) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                    <p className="text-gray-400 font-bold text-xs tracking-widest uppercase">Joining Room...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-screen h-screen bg-zinc-50 overflow-hidden relative"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
        >
            <ReactFlow
                nodes={[...nodes]}
                edges={[...edges]}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                connectionMode={ConnectionMode.Loose}

                selectionKeyCode={["Control", "Meta"]}
                multiSelectionKeyCode={["Control", "Meta"]}
                selectionMode={SelectionMode.Partial}

                defaultEdgeOptions={{ type: "default" }}
                fitView
            >
                <Background gap={12} size={2} color={dotColor} />
                <Controls />

                {/* Render Kursor Realtime User Lain */}
                {others.map(({ connectionId, presence }) => {
                    if (!presence || !presence.cursor) return null;
                    return (
                        <div
                            key={connectionId}
                            className="absolute pointer-events-none z-[9999] flex flex-col items-start transition-transform duration-75"
                            style={{
                                left: 0, top: 0,
                                transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)`
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none shadow-sm">
                                <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" fill="#9ca3af" stroke="white" strokeWidth="1.5" />
                            </svg>
                            <span className="bg-gray-400 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg font-bold ml-1">
                                User {connectionId}
                            </span>
                        </div>
                    );
                })}
            </ReactFlow>

            {/* Toolbar Fixed Bottom (Gray Buttons) */}
            <Toolbar.Root className="flex gap-2 fixed bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl border border-zinc-200 px-4 h-16 items-center z-50">
                <Tooltip.Provider>
                    {Object.keys(NODE_TYPES).map((type) => (
                        <Tooltip.Root key={type}>
                            <Tooltip.Trigger asChild>
                                <Toolbar.Button
                                    className="w-10 h-10 bg-gray-400 rounded-xl hover:bg-gray-500 transition-all flex items-center justify-center text-[10px] text-white font-bold uppercase shadow-sm active:scale-90"
                                    onClick={() => handleAddNode(type as nodeTypes)}
                                >
                                    {type.substring(0, 2)}
                                </Toolbar.Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content side="top" className="bg-zinc-800 text-white rounded-lg p-2 text-[10px] font-bold mb-2 uppercase tracking-tighter">
                                {type}
                            </Tooltip.Content>
                        </Tooltip.Root>
                    ))}

                    <div className="w-[1px] h-8 bg-zinc-100 mx-2" />

                    <Toolbar.Button
                        onClick={selectAll}
                        className="px-4 h-10 bg-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-95 uppercase tracking-widest"
                    >
                        SELECT ALL
                    </Toolbar.Button>
                </Tooltip.Provider>
            </Toolbar.Root>
        </div>
    );
}

// Komponen Export Utama dengan ID Room Dinamis
export function Canvas() {
    const { roomId } = useParams(); // Menangkap ID dari URL browser

    return (
        <RoomProvider
            id={roomId || "default-room"}
            initialPresence={{ cursor: null }}
            initialStorage={{
                nodes: new LiveList([]),
                edges: new LiveList([])
            }}
        >
            <ReactFlowProvider>
                <CollaborativeCanvas />
            </ReactFlowProvider>
        </RoomProvider>
    );
}