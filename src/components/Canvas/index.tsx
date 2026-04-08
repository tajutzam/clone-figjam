import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    BackgroundVariant,
} from "reactflow";
import * as Toolbar from "@radix-ui/react-toolbar";
import * as Tooltip from "@radix-ui/react-tooltip";

import {
    RoomProvider,
    useStorage,
    useMutation,
    useMyPresence,
    useOthers
} from "../../config/liveblocks.config";
import { LiveList, LiveObject } from "@liveblocks/client";

import { auth } from "../../config/firebase.config";
import { onAuthStateChanged } from "firebase/auth";

import { Square } from "../Nodes/Square";
import { Circle } from "../Nodes/Circle";
import { Triangle } from "../Nodes/Triangle";
import { TableNode } from "../Nodes/Table";
import { StickyNode } from "../Nodes/Sticky";
import { DiamondNode } from "../Nodes/Diamond";
import { Default } from "../Edges/Default";

import "reactflow/dist/style.css";

const dotColor = "#E2E8F0";

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
    const navigate = useNavigate();
    const nodes = useStorage((root) => root.nodes);
    const edges = useStorage((root) => root.edges);
    const [myPresence, updateMyPresence] = useMyPresence();
    const others = useOthers();

    const [isOverTrash, setIsOverTrash] = useState(false);
    const [inviteStatus, setInviteStatus] = useState("Invite People");

    const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

    const handleInvite = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setInviteStatus("Link Copied!");
        setTimeout(() => setInviteStatus("Invite People"), 2000);
    };

    // --- MUTATIONS ---
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
        const edgeId = `edge-${crypto.randomUUID()}`;
        const newEdge = {
            ...connection,
            id: edgeId,
            type: "default",
        };
        liveEdges.push(new LiveObject(newEdge as any));
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
            data: { label: "", color: type === 'sticky' ? '#fef9c3' : '#ffffff' },
        } as any));
    }, []);

    const deleteNode = useMutation(({ storage }, nodeId: string) => {
        const liveNodes = storage.get("nodes");
        const index = liveNodes.findIndex((n) => n.get("id") === nodeId);
        if (index !== -1) liveNodes.delete(index);

        const liveEdges = storage.get("edges");
        for (let i = liveEdges.length - 1; i >= 0; i--) {
            const edge = liveEdges.get(i);
            if (edge?.get("source") === nodeId || edge?.get("target") === nodeId) {
                liveEdges.delete(i);
            }
        }
    }, []);

    const deleteEdge = useMutation(({ storage }, edgeId: string) => {
        const liveEdges = storage.get("edges");
        const index = liveEdges.findIndex((e) => e.get("id") === edgeId);
        if (index !== -1) {
            liveEdges.delete(index);
        }
    }, []);

    const selectAll = useMutation(({ storage }) => {
        const liveNodes = storage.get("nodes");
        liveNodes.forEach((node) => node.update({ selected: true }));
    }, []);

    // --- KEYBOARD DELETE LOGIC ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Backspace" || event.key === "Delete") {
                const activeElement = document.activeElement;
                const isTyping =
                    activeElement?.tagName === "INPUT" ||
                    activeElement?.tagName === "TEXTAREA" ||
                    activeElement?.hasAttribute("contenteditable");

                if (isTyping) return;

                // Hapus Node terpilih
                nodes?.forEach((node: any) => {
                    if (node.selected) deleteNode(node.id);
                });

                // Hapus Edge terpilih
                edges?.forEach((edge: any) => {
                    if (edge.selected) deleteEdge(edge.id);
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nodes, edges, deleteNode, deleteEdge]);

    // --- MAPPING BENTUK UNTUK TOOLBAR (CSS ONLY) ---
    const SHAPE_THUMBNAILS: Record<string, React.ReactNode> = {
        square: <div className="w-5 h-5 border-2 border-current rounded-sm" />,
        circle: <div className="w-5 h-5 border-2 border-current rounded-full" />,
        triangle: <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-current" />,
        diamond: <div className="w-4 h-4 border-2 border-current rotate-45" />,
        sticky: <div className="w-5 h-5 bg-current opacity-80 rounded-sm shadow-[2px_2px_0px_rgba(0,0,0,0.2)]" />,
        table: (
            <div className="w-5 h-5 border-2 border-current grid grid-cols-2 grid-rows-2">
                <div className="border-b border-r border-current"></div>
                <div className="border-b border-current"></div>
                <div className="border-r border-current"></div>
                <div></div>
            </div>
        ),
    };

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        updateMyPresence({ cursor: { x: Math.floor(e.clientX), y: Math.floor(e.clientY) } });
    }, [updateMyPresence]);

    const onPointerLeave = useCallback(() => {
        updateMyPresence({ cursor: null });
    }, [updateMyPresence]);

    if (nodes === null || edges === null) return null;

    return (
        <div className="w-screen h-screen bg-[#F8FAFC] overflow-hidden relative font-sans" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>

            {/* --- HEADER --- */}
            <div className="fixed top-6 left-6 right-6 z-[100] flex justify-between items-center pointer-events-none">
                <button
                    onClick={() => navigate("/")}
                    className="pointer-events-auto bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all flex items-center gap-2 group"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900">Dashboard</span>
                </button>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="flex -space-x-3 items-center mr-2">
                        <div
                            className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm z-30"
                            style={{ backgroundColor: myPresence.user?.color || "#18181b" }}
                        >
                            {getInitial(myPresence.user?.name || "")}
                        </div>
                        {others.map(({ connectionId, presence }) => {
                            if (!presence?.user) return null;
                            return (
                                <div
                                    key={connectionId}
                                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-transform hover:-translate-y-1"
                                    style={{ backgroundColor: presence.user.color }}
                                >
                                    {getInitial(presence.user.name)}
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={handleInvite} className="bg-zinc-900 text-white px-5 py-2.5 rounded-2xl shadow-xl hover:bg-zinc-800 transition-all flex items-center gap-2 active:scale-95">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">{inviteStatus}</span>
                    </button>
                </div>
            </div>

            <ReactFlow
                nodes={[...nodes]}
                edges={[...edges]}
                nodeTypes={NODE_TYPES}
                edgeTypes={EDGE_TYPES}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                connectionMode={ConnectionMode.Loose}
                selectionMode={SelectionMode.Partial}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={dotColor} />
                <Controls className="bg-white border-zinc-200 shadow-xl rounded-lg !m-6" />

                {/* Cursor Multiplayer */}
                {others.map(({ connectionId, presence }) => {
                    if (!presence || !presence.cursor) return null;
                    const userColor = presence.user?.color || "#64748b";
                    return (
                        <div key={connectionId} className="absolute pointer-events-none z-[9999] transition-transform duration-75 ease-out" style={{ left: 0, top: 0, transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)` }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-md">
                                <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" fill={userColor} stroke="white" strokeWidth="1.5" />
                            </svg>
                            <div className="ml-3 px-2 py-0.5 rounded-md shadow-xl backdrop-blur-md" style={{ backgroundColor: `${userColor}CC` }}>
                                <span className="text-white text-[9px] font-bold">{presence.user?.name || 'User'}</span>
                            </div>
                        </div>
                    );
                })}
            </ReactFlow>

            {/* --- TOOLBAR --- */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-white/80 backdrop-blur-2xl border border-zinc-200/50 rounded-[2.5rem] shadow-2xl flex items-center gap-3">
                <Toolbar.Root className="flex items-center gap-2">
                    <Tooltip.Provider delayDuration={0}>
                        {Object.keys(NODE_TYPES).map((type) => (
                            <Tooltip.Root key={type}>
                                <Tooltip.Trigger asChild>
                                    <Toolbar.Button
                                        className="w-12 h-12 bg-white border border-zinc-200 text-zinc-600 rounded-2xl hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-90 group"
                                        onClick={() => handleAddNode(type as nodeTypes)}
                                    >
                                        <div className="transition-transform group-hover:scale-110">
                                            {SHAPE_THUMBNAILS[type] || SHAPE_THUMBNAILS.square}
                                        </div>
                                    </Toolbar.Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content side="top" className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold mb-3 shadow-xl uppercase tracking-widest">
                                    Add {type}
                                </Tooltip.Content>
                            </Tooltip.Root>
                        ))}
                        <div className="w-[1px] h-8 bg-zinc-200 mx-2" />
                        <Toolbar.Button onClick={selectAll} className="h-12 px-5 bg-zinc-100 text-zinc-500 rounded-2xl text-[10px] font-black hover:bg-zinc-200 hover:text-zinc-900 transition-all uppercase tracking-widest">
                            Select All
                        </Toolbar.Button>
                    </Tooltip.Provider>
                </Toolbar.Root>
            </div>
        </div>
    );
}

export function Canvas() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) navigate("/");
            else { setUser(currentUser); setLoading(false); }
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) return null;

    return (
        <RoomProvider
            id={roomId || "default-room"}
            initialPresence={{ cursor: null, user: { name: user?.displayName || "Anonymous", color: getRandomColor() } }}
            initialStorage={{ nodes: new LiveList([]), edges: new LiveList([]) }}
        >
            <ReactFlowProvider>
                <CollaborativeCanvas />
            </ReactFlowProvider>
        </RoomProvider>
    );
}

const getRandomColor = () => ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"][Math.floor(Math.random() * 6)];