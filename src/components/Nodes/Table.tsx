import { Handle, NodeProps, Position } from "reactflow";
import { StyledNodeResizer } from "../StyledNodeResizer";
import { useMutation } from "../../config/liveblocks.config";

export function TableNode({ selected, data, id }: NodeProps) {
    // Ambil data dari storage (Liveblocks)
    const columns = data?.columns || ["Kolom A", "Kolom B"];
    const rows = data?.rows || [["Data 1", "Data 2"], ["Data 3", "Data 4"]];

    // --- MUTATIONS (Sinkronisasi Realtime) ---
    const updateTableData = useMutation(({ storage }, newData: any) => {
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

    const addColumn = () => {
        const newColumns = [...columns, `Kolom Baru`];
        const newRows = rows.map((row: any) => [...row, ""]);
        updateTableData({ columns: newColumns, rows: newRows });
    };

    const addRow = () => {
        const newRows = [...rows, new Array(columns.length).fill("")];
        updateTableData({ rows: newRows });
    };

    const removeColumn = (index: number) => {
        if (columns.length <= 1) return;
        const newColumns = columns.filter((_: any, i: number) => i !== index);
        const newRows = rows.map((row: any) => row.filter((_: any, i: number) => i !== index));
        updateTableData({ columns: newColumns, rows: newRows });
    };

    const removeRow = (index: number) => {
        if (rows.length <= 1) return;
        const newRows = rows.filter((_: any, i: number) => i !== index);
        updateTableData({ rows: newRows });
    };

    const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
        const newRows = [...rows];
        newRows[rowIndex][cellIndex] = value;
        updateTableData({ rows: newRows });
    };

    const handleHeaderChange = (index: number, value: string) => {
        const newCols = [...columns];
        newCols[index] = value;
        updateTableData({ columns: newCols });
    };

    return (
        <div className={`bg-white border-2 ${selected ? 'border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'border-zinc-200'} rounded-xl shadow-xl min-w-[280px] flex flex-col relative group transition-all`}>

            <StyledNodeResizer selected={selected} minWidth={280} minHeight={150} />

            {/* --- HANDLES --- */}
            <Handle type="target" position={Position.Top} id="t-top" className="w-3 h-3 !bg-zinc-400 border-2 border-white" />
            <Handle type="source" position={Position.Bottom} id="s-bottom" className="w-3 h-3 !bg-zinc-400 border-2 border-white" />
            <Handle type="target" position={Position.Left} id="t-left" className="w-3 h-3 !bg-zinc-400 border-2 border-white" />
            <Handle type="source" position={Position.Right} id="s-right" className="w-3 h-3 !bg-zinc-400 border-2 border-white" />

            {/* Header Tabel */}
            <div className="bg-zinc-100 border-b-2 border-zinc-200 flex h-10 rounded-t-xl overflow-hidden">
                {columns.map((col: string, i: number) => (
                    <div key={i} className="flex-1 border-r border-zinc-200 relative group/col flex items-center px-2 bg-zinc-100">
                        <input
                            className="bg-transparent border-none outline-none w-full font-bold text-[10px] uppercase tracking-wider text-zinc-600 nodrag"
                            value={col}
                            onChange={(e) => handleHeaderChange(i, e.target.value)}
                            spellCheck={false}
                        />
                        <button
                            onClick={() => removeColumn(i)}
                            className="hidden group-hover/col:flex absolute -top-1 -right-1 bg-zinc-800 text-white rounded-full w-4 h-4 items-center justify-center text-[8px] hover:bg-red-500 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    onClick={addColumn}
                    className="bg-zinc-200 hover:bg-zinc-300 text-zinc-600 px-3 text-sm font-bold transition-colors nodrag"
                >
                    +
                </button>
            </div>

            {/* Body Tabel */}
            <div className="flex-1 flex flex-col text-[11px] text-zinc-800">
                {rows.map((row: string[], rowIndex: number) => (
                    <div key={rowIndex} className="flex border-b border-zinc-100 group/row min-h-[38px] hover:bg-zinc-50/50 transition-colors relative">
                        {row.map((cell: string, cellIndex: number) => (
                            <div key={cellIndex} className="flex-1 border-r border-zinc-100 p-2 relative flex items-center">
                                <textarea
                                    className="bg-transparent border-none outline-none w-full resize-none nodrag overflow-hidden leading-relaxed"
                                    value={cell}
                                    rows={1}
                                    onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => removeRow(rowIndex)}
                            className="hidden group-hover/row:flex absolute -right-8 bg-zinc-100 hover:bg-red-50 text-zinc-400 hover:text-red-500 border border-zinc-200 rounded px-1.5 py-1 text-[8px] font-bold uppercase tracking-tighter transition-all nodrag shadow-sm"
                        >
                            Delete
                        </button>
                    </div>
                ))}

                <button
                    onClick={addRow}
                    className="bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all nodrag border-t border-zinc-100 rounded-b-xl"
                >
                    + Add New Row
                </button>
            </div>
        </div>
    );
}