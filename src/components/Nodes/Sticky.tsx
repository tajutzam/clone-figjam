import { NodeProps } from "reactflow";
import { StyledNodeResizer } from "../StyledNodeResizer";
import { useMutation } from "../../config/liveblocks.config";
import { Default } from "./Default";

const STICKY_COLORS = [
    { name: "Yellow", value: "#fef08a" }, // Default
    { name: "Pink", value: "#fbcfe8" },
    { name: "Green", value: "#bbf7d0" },
    { name: "Blue", value: "#bfdbfe" },
    { name: "Purple", value: "#e9d5ff" },
    { name: "Orange", value: "#fed7aa" },
];

export function StickyNode({ selected, data, id }: NodeProps) {
    
    // Mutation gabungan untuk update teks atau warna secara realtime
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
        <div 
            style={{ backgroundColor: data?.color || "#fef08a" }} 
            className={`
                shadow-xl p-6 min-w-[150px] min-h-[150px] 
                flex items-center justify-center text-center relative transition-all duration-200
                ${selected ? 'ring-2 ring-red-500 scale-[1.02] z-10' : ''}
            `}
        >
            <StyledNodeResizer selected={selected} minWidth={100} minHeight={100} />

            {/* --- COLOR PICKER TOOLBAR --- */}
            {selected && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white border border-zinc-200 p-1.5 rounded-2xl shadow-2xl z-[100] nodrag">
                    {STICKY_COLORS.map((col) => (
                        <button
                            key={col.value}
                            onClick={() => updateNodeData({ color: col.value })}
                            className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 active:scale-90 ${data?.color === col.value ? 'border-zinc-900 ring-2 ring-zinc-100' : 'border-zinc-200'}`}
                            style={{ backgroundColor: col.value }}
                        />
                    ))}
                </div>
            )}

            <textarea
                className="bg-transparent border-none outline-none resize-none w-full h-full text-zinc-800 placeholder-zinc-500/50 text-sm font-medium nodrag scrollbar-hide"
                placeholder="Tulis sesuatu..."
                value={data?.label || ""}
                onChange={(e) => updateNodeData({ label: e.target.value })}
                spellCheck={false}
            />

            {/* Handle koneksi default */}
            <Default />
        </div>
    );
}