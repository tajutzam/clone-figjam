import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Canvas } from "./components/Canvas";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/room/:roomId" element={<Canvas />} />
            </Routes>
        </BrowserRouter>
    );
}