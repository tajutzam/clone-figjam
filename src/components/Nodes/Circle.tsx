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

export function Circle({ selected, data, id }: NodeProps) {

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
            // Baris ini yang mengatur perubahan BG Color secara dinamis
            style={{ backgroundColor: data?.color || "#ffffff" }}
            className={`
                border-2 rounded-full w-full h-full min-w-[128px] min-h-[128px] 
                flex items-center justify-center p-6 transition-all duration-200 
                relative 
                ${selected ? 'border-zinc-900 shadow-xl scale-[1.02]' : 'border-zinc-300 shadow-sm'}
            `}
        >

            {/* --- HANDLES --- */}
            <Handle
                type="target"
                position={Position.Top}
                id="t-top"
                className="w-3 h-3 !bg-zinc-400 border-2 border-white translate-y-[-2px]"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="s-bottom"
                className="w-3 h-3 !bg-zinc-400 border-2 border-white translate-y-[2px]"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="t-left"
                className="w-3 h-3 !bg-zinc-400 border-2 border-white translate-x-[-2px]"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="s-right"
                className="w-3 h-3 !bg-zinc-400 border-2 border-white translate-x-[2px]"
            />

            <StyledNodeResizer selected={selected} minWidth={100} minHeight={100} />

            {/* --- COLOR PICKER OPSI --- */}
            {selected && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white border border-zinc-200 p-1.5 rounded-2xl shadow-2xl z-[100] nodrag">
                    {COLORS.map((col) => (
                        <button
                            key={col.value}
                            // Mengirim objek color ke mutation updateNodeData
                            onClick={() => updateNodeData({ color: col.value })}
                            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 active:scale-90 ${data?.color === col.value ? 'border-zinc-900 ring-2 ring-zinc-100' : 'border-zinc-200'}`}
                            style={{ backgroundColor: col.value }}
                        />
                    ))}
                </div>
            )}

            <textarea
                className="bg-transparent border-none outline-none w-full text-center text-zinc-800 font-medium text-sm resize-none nodrag placeholder:text-zinc-300 leading-tight"
                placeholder="Tambah teks..."
                value={data?.label || ""}
                onChange={(e) => updateNodeData({ label: e.target.value })}
                spellCheck={false}
                rows={2}
            />

        </div>
    );
}