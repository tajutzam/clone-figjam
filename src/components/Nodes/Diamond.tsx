
import { useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { StyledNodeResizer } from "../StyledNodeResizer";
import { Default } from "./Default";

export function DiamondNode({ selected }: NodeProps) {
    return (
        <div className="relative min-w-[120px] min-h-[120px] flex items-center justify-center">
            <StyledNodeResizer selected={selected} />

            <div
                className="absolute inset-0 bg-amber-400 border-2 border-amber-600"
                style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
            />

            <div className="z-10 p-4 text-xs font-medium text-amber-900 outline-none" contentEditable>
                Decision?
            </div>

         
            <Handle type="target" position={Position.Top} id="t-top" className="!bg-gray-400" />
            <Handle type="source" position={Position.Top} id="s-top" className="!bg-gray-400" />

            {/* Bottom */}
            <Handle type="target" position={Position.Bottom} id="t-bottom" className="!bg-gray-400" />
            <Handle type="source" position={Position.Bottom} id="s-bottom" className="!bg-gray-400" />

            {/* Left */}
            <Handle type="target" position={Position.Left} id="t-left" className="!bg-gray-400" />
            <Handle type="source" position={Position.Left} id="s-left" className="!bg-gray-400" />

            {/* Right */}
            <Handle type="target" position={Position.Right} id="t-right" className="!bg-gray-400" />
            <Handle type="source" position={Position.Right} id="s-right" className="!bg-gray-400" />
        </div>
    );
}