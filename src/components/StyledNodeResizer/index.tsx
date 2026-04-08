import { NodeResizer } from "@reactflow/node-resizer";


interface StyledNodeResizerProps {
    selected: boolean;
    minWidth?: number;
    minHeight?: number;
}

export function StyledNodeResizer({ 
    selected, 
    minWidth = 80, 
    minHeight = 80 
}: StyledNodeResizerProps) {
    
    // Kita tetap render tapi kontrol visibility lewat props selected agar transisi lebih smooth
    return (
        <NodeResizer
            isVisible={selected}
            minWidth={minWidth}
            minHeight={minHeight}
            // Garis seleksi dibuat tipis dan berwarna gelap
            lineClassName="border-zinc-400 border-dashed border-[1px]"
            // Handle (titik tarik) dibuat kotak minimalis dengan shadow
            handleClassName="h-2.5 w-2.5 bg-white border-[1.5px] rounded-sm border-zinc-900 shadow-sm hover:bg-zinc-900 transition-colors"
        />
    );
}