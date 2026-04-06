import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Dashboard() {
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState("");

    const createNewBoard = () => {
        const id = crypto.randomUUID();
        navigate(`/room/${id}`);
    };

    return (
        <div className="w-screen h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-zinc-200 p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-400 rounded-2xl mb-6 flex items-center justify-center shadow-inner">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">FigJam Clone</h1>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                    Mulai kolaborasi realtime dengan tim kamu. Buat board baru sekarang.
                </p>

                <div className="w-full space-y-4">
                    <input
                        type="text"
                        placeholder="Nama Board (Opsional)"
                        className="w-full px-4 py-3 bg-zinc-100 border-none rounded-xl focus:ring-2 focus:ring-gray-400 outline-none transition-all text-sm"
                        onChange={(e) => setRoomName(e.target.value)}
                    />

                    <button
                        onClick={createNewBoard}
                        className="w-full py-4 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95"
                    >
                        CREATE NEW BOARD
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-100 w-full">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Ready to collaborate?
                    </p>
                </div>
            </div>
        </div>
    );
}