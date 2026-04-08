import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db, googleProvider } from "../config/firebase.config";
import { signInWithPopup, onAuthStateChanged, User, signOut } from "firebase/auth";
import {
    collection, addDoc, query, where, onSnapshot,
    doc, deleteDoc, updateDoc, serverTimestamp, orderBy
} from "firebase/firestore";

export function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [roomName, setRoomName] = useState("");
    const [myRooms, setMyRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                const q = query(
                    collection(db, "rooms"),
                    where("createdBy", "==", currentUser.uid),
                    orderBy("createdAt", "desc")
                );
                const unsubscribeRooms = onSnapshot(q, (snapshot) => {
                    setMyRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                });
                return () => unsubscribeRooms();
            } else {
                setMyRooms([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const login = () => signInWithPopup(auth, googleProvider);
    const logout = () => signOut(auth);

    const createNewBoard = async () => {
        if (!user || !roomName.trim()) return;
        const roomId = crypto.randomUUID();
        await addDoc(collection(db, "rooms"), {
            roomId: roomId,
            name: roomName,
            createdBy: user.uid,
            creatorName: user.displayName,
            createdAt: serverTimestamp(),
        });
        setRoomName("");
        navigate(`/room/${roomId}`);
    };

    const deleteRoom = async (firestoreId: string) => {
        if (window.confirm("Hapus board ini secara permanen?")) {
            await deleteDoc(doc(db, "rooms", firestoreId));
        }
    };

    const renameRoom = async (firestoreId: string) => {
        const newName = window.prompt("Masukkan nama baru:");
        if (newName) await updateDoc(doc(db, "rooms", firestoreId), { name: newName });
    };

    if (loading) return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mb-4" />
            <p className="text-zinc-400 font-medium animate-pulse">Menyiapkan workspace...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200">
            <div className="max-w-6xl mx-auto px-6 py-10">

                <header className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Boardly</h1>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Workspace</p>
                        </div>
                    </div>

                    {user && (
                        <div className="flex items-center gap-4 bg-white p-1.5 pl-4 rounded-2xl border border-zinc-200 shadow-sm">
                            <div className="text-right">
                                <p className="text-xs font-bold leading-none">{user.displayName}</p>
                                <button onClick={logout} className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors font-medium">Sign out</button>
                            </div>
                            <img src={user.photoURL!} className="w-8 h-8 rounded-lg object-cover border border-zinc-100" alt="profile" />
                        </div>
                    )}
                </header>

                {!user ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                        <div className="text-center max-w-sm">
                            <h2 className="text-4xl font-black mb-4 tracking-tighter">Ide besar dimulai di sini.</h2>
                            <p className="text-zinc-500 mb-8 text-sm">Masuk dengan akun Google untuk membuat board kolaboratif dan mulai bekerja secara realtime.</p>
                            <button onClick={login} className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Lanjutkan dengan Google
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                        {/* Sidebar: New Board */}
                        <aside className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm shadow-zinc-100">
                                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6">Create New</h2>
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Nama board..."
                                            value={roomName}
                                            className="w-full pl-4 pr-12 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-zinc-300 focus:ring-0 outline-none transition-all text-sm font-medium"
                                            onChange={(e) => setRoomName(e.target.value)}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center opacity-0 group-focus-within:opacity-100 transition-opacity">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                    <button
                                        onClick={createNewBoard}
                                        disabled={!roomName.trim()}
                                        className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-300 text-white font-bold rounded-2xl shadow-lg shadow-zinc-200 transition-all active:scale-95"
                                    >
                                        Buat Board
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-zinc-100 rounded-2xl border border-zinc-200/50">
                                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                                    Tip: Bagikan link URL di dalam board untuk mengundang teman berkolaborasi secara realtime.
                                </p>
                            </div>
                        </aside>

                        {/* Main Grid: My Boards */}
                        <main className="lg:col-span-3">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-bold tracking-tight">Board Terakhir</h2>
                                <span className="px-3 py-1 bg-zinc-100 text-[10px] font-black uppercase tracking-wider rounded-full text-zinc-500">
                                    {myRooms.length} Boards
                                </span>
                            </div>

                            {myRooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 rounded-[3rem]">
                                    <p className="text-zinc-400 text-sm font-medium">Belum ada board yang dibuat.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {myRooms.map((room) => (
                                        <div key={room.id} className="group relative bg-white rounded-[2rem] border border-zinc-200 p-2 hover:shadow-2xl hover:shadow-zinc-200/50 hover:-translate-y-1 transition-all duration-300">
                                            {/* Preview Placeholder */}
                                            <div
                                                onClick={() => navigate(`/room/${room.roomId}`)}
                                                className="w-full aspect-video bg-zinc-50 rounded-[1.5rem] mb-4 flex items-center justify-center overflow-hidden cursor-pointer group-hover:bg-zinc-100 transition-colors"
                                            >
                                                <span className="text-5xl font-black text-zinc-100 group-hover:text-zinc-200 transition-colors">
                                                    {room.name[0].toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="px-4 pb-4">
                                                <div className="flex justify-between items-start">
                                                    <div onClick={() => navigate(`/room/${room.roomId}`)} className="cursor-pointer flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm truncate group-hover:text-zinc-600 transition-colors">
                                                            {room.name}
                                                        </h3>
                                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                                                            {room.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>

                                                    {/* Actions Menu */}
                                                    <div className="flex gap-1 ml-2 translate-y-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => renameRoom(room.id)} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                        </button>
                                                        <button onClick={() => deleteRoom(room.id)} className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-500 transition-colors">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
}