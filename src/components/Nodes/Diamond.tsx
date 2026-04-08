import { Handle, NodeProps, Position } from "reactflow";
import { StyledNodeResizer } from "../StyledNodeResizer";
import { useMutation } from "../../config/liveblocks.config";

const COLORS = [
    { name: "White", value: "#ffffff" },
    { name: "Yellow", value: "#fef9c3" },
    { name: "Blue", value: "#dbeafe" },
    { name: "Green", value: "#dcfce7" },
    { name: "Red", value: "#fee2e2" },
    { name: "Purple", value: "#f3e8ff" },
];

export function DiamondNode({ selected, data, id }: NodeProps) {

    // Mutation untuk update teks atau warna secara realtime
    const updateNodeData = useMutation(({ storage }, newData: any) => {
        const liveNodes = storage.get("nodes");
        const nodeIndex = liveNodes.findIndex((n) => n.get("id") === id);

        if (nodeIndex !== -1) {
            const node = liveNodes.get(nodeIndex);
            node?.update({
                data: {
                    ...node.get("data"),
                    ...newData
                }
            });
        }
    }, [id]);

    return (
        <div className="relative min-w-[120px] min-h-[120px] flex items-center justify-center p-4">

            {/* --- COLOR PICKER TOOLBAR --- */}
            {selected && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white border border-zinc-200 p-1.5 rounded-2xl shadow-2xl z-[100] nodrag">
                    {COLORS.map((col) => (
                        <button
                            key={col.value}
                            onClick={() => updateNodeData({ color: col.value })}
                            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 active:scale-90 ${data?.color === col.value ? 'border-zinc-900 ring-2 ring-zinc-100' : 'border-zinc-200'}`}
                            style={{ backgroundColor: col.value }}
                        />
                    ))}
                </div>
            )}

            {/* Bentuk Diamond (Fake Border dengan 2 Layer) */}
            <div
                className={`
                    absolute inset-0 transition-all duration-200
                    ${selected ? 'bg-zinc-900 shadow-xl' : 'bg-zinc-300'}
                `}
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            >
                {/* Layer Isi Warna */}
                <div
                    className="absolute inset-[2px] transition-colors duration-200"
                    style={{
                        clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                        backgroundColor: data?.color || "#ffffff"
                    }}
                />
            </div>

            {/* Handles - Ditempatkan tepat di ujung-ujung belah ketupat */}
            <Handle
                type="target"
                position={Position.Top}
                id="t-top"
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="s-bottom"
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="t-left"
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="s-right"
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white"
            />

            <StyledNodeResizer selected={selected} minWidth={100} minHeight={100} />

            {/* Input Teks Tengah */}
            <textarea
                className="relative z-10 bg-transparent border-none outline-none w-[70%] text-center text-zinc-800 font-medium text-[10px] resize-none nodrag placeholder:text-zinc-300 leading-tight"
                placeholder="Decision?"
                value={data?.label || ""}
                onChange={(e) => updateNodeData({ label: e.target.value })}
                spellCheck={false}
                rows={2}
            />
        </div>
    );
}