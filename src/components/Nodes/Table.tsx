import { useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { StyledNodeResizer } from "../StyledNodeResizer";

export function TableNode({ selected, data }: NodeProps) {
    const [columns, setColumns] = useState(["Column A", "Column B"]);
    const [rows, setRows] = useState([
        ["Data 1", "Data 2"],
        ["Data 3", "Data 4"],
    ]);

    const addColumn = () => {
        setColumns([...columns, `New Col`]);
        setRows(rows.map((row) => [...row, ""]));
    };

    const addRow = () => {
        setRows([...rows, new Array(columns.length).fill("")]);
    };

    const removeColumn = (index: number) => {
        if (columns.length <= 1) return;
        setColumns(columns.filter((_, i) => i !== index));
        setRows(rows.map((row) => row.filter((_, i) => i !== index)));
    };

    const removeRow = (index: number) => {
        if (rows.length <= 1) return;
        setRows(rows.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg min-w-[250px] flex flex-col relative group">
            <StyledNodeResizer selected={selected} />

            <div className="bg-gray-100 border-b-2 border-gray-200 flex h-10">
                {columns.map((col, i) => (
                    <div key={i} className="flex-1 border-r border-gray-200 relative group/col flex items-center px-2">
                        <input
                            className="bg-transparent border-none outline-none w-full font-bold text-xs text-gray-600 nodrag"
                            defaultValue={col}
                            spellCheck={false}
                        />
                        <button
                            onClick={() => removeColumn(i)}
                            className="hidden group-hover/col:block absolute -top-2 right-0 bg-red-400 text-white rounded-full w-4 h-4 text-[10px]"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={addColumn}
                    className="bg-gray-300 hover:bg-gray-400 text-white px-2 text-lg leading-none transition-colors nodrag"
                >
                    +
                </button>
            </div>

            <div className="flex-1 flex flex-col text-xs text-gray-800">
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex border-b border-gray-100 group/row min-h-[35px]">
                        {row.map((cell, cellIndex) => (
                            <div key={cellIndex} className="flex-1 border-r border-gray-100 p-2 relative flex items-center">
                                <textarea
                                    className="bg-transparent border-none outline-none w-full resize-none nodrag overflow-hidden"
                                    defaultValue={cell}
                                    rows={1}
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => removeRow(rowIndex)}
                            className="hidden group-hover/row:block absolute -right-6 bg-gray-200 hover:bg-gray-300 text-gray-500 rounded p-1 nodrag"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
                <button
                    onClick={addRow}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-400 py-1 text-xs transition-colors nodrag border-t border-gray-200"
                >
                    + Add Row
                </button>
            </div>

            <Handle type="target" position={Position.Top} id="t-top" className="opacity-0" />
            <Handle type="source" position={Position.Top} id="s-top" className="opacity-0" />
            <Handle type="target" position={Position.Bottom} id="t-bottom" className="opacity-0" />
            <Handle type="source" position={Position.Bottom} id="s-bottom" className="opacity-0" />
            <Handle type="target" position={Position.Left} id="t-left" className="opacity-0" />
            <Handle type="source" position={Position.Left} id="s-left" className="opacity-0" />
            <Handle type="target" position={Position.Right} id="t-right" className="opacity-0" />
            <Handle type="source" position={Position.Right} id="s-right" className="opacity-0" />
        </div>
    );
}