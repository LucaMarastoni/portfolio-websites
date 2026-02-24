import { Link, Navigate, Route, Routes } from "react-router-dom";
import { StarsCanvas } from "./components/Background/StarsCanvas";
import { LegacyScriptsLoader } from "./components/LegacyScriptsLoader";
import Home from "./pages/Home";
import CRM from "./pages/CRM";

export default function App() {
  return (
    <>
      <StarsCanvas />
      <LegacyScriptsLoader />

      <nav className="router-sr-nav" aria-label="Navigazione routing">
        <Link to="/">Home</Link>
        <Link to="/crm">CRM</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
