import { Handle, Position } from "reactflow";

export function NodeHandles() {
    return (
        <>
            <Handle
                type="target"
                position={Position.Top}
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white hover:scale-125 transition-transform"
            />
            <Handle
                type="target"
                position={Position.Bottom}
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white hover:scale-125 transition-transform"
            />

            <Handle
                type="source"
                position={Position.Left}
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white hover:scale-125 transition-transform"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-2.5 h-2.5 !bg-zinc-400 border-2 border-white hover:scale-125 transition-transform"
            />
        </>
    );
}