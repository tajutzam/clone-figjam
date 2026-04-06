import { Handle, NodeProps, Position } from "reactflow";
import { StyledNodeResizer } from "../StyledNodeResizer";

export function StickyNode({ selected }: NodeProps) {
    return (
        <div className="bg-yellow-200 shadow-xl p-4 min-w-[150px] min-h-[150px] flex items-center justify-center text-center relative">
            <StyledNodeResizer selected={selected} />

            <textarea
                className="bg-transparent border-none outline-none resize-none w-full h-full text-gray-800 placeholder-yellow-600/50"
                placeholder="Tulis sesuatu..."
                defaultValue="Idea!"
            />

            <Handle type="target" position={Position.Top} id="t-top" className="opacity-0 !bg-gray-400" />
            <Handle type="source" position={Position.Top} id="s-top" className="opacity-0 !bg-gray-400" />

            <Handle type="target" position={Position.Bottom} id="t-bottom" className="opacity-0 !bg-gray-400" />
            <Handle type="source" position={Position.Bottom} id="s-bottom" className="opacity-0 !bg-gray-400" />

            <Handle type="target" position={Position.Left} id="t-left" className="opacity-0 !bg-gray-400" />
            <Handle type="source" position={Position.Left} id="s-left" className="opacity-0 !bg-gray-400" />

            <Handle type="target" position={Position.Right} id="t-right" className="opacity-0 !bg-gray-400" />
            <Handle type="source" position={Position.Right} id="s-right" className="opacity-0 !bg-gray-400" />
        </div>
    );
}