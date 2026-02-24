import { Link, Navigate, Route, Routes } from "react-router-dom";
import { ShaderGradientBackground } from "./components/Background/ShaderGradientBackground";
import { LegacyScriptsLoader } from "./components/LegacyScriptsLoader";
import StaggeredMenu from "./components/Menu/StaggeredMenu";
import Home from "./pages/Home";
import CRM from "./pages/CRM";

const menuItems = [
  { label: "Home", ariaLabel: "Vai alla home", link: "#/" },
  { label: "Servizi", ariaLabel: "Vai alla sezione servizi", link: "#/?section=services" },
  { label: "Metodo", ariaLabel: "Vai alla sezione metodo", link: "#/?section=process" },
  { label: "Progetti", ariaLabel: "Vai alla sezione progetti", link: "#/?section=progetti" },
  { label: "CRM", ariaLabel: "Vai alla pagina CRM", link: "#/crm" },
  { label: "Contatti", ariaLabel: "Vai alla sezione contatti", link: "#/?section=contatti" },
];

const socialItems = [
  { label: "LinkedIn", link: "https://www.linkedin.com/in/luca-marastoni-387329304/" },
  { label: "Instagram", link: "https://www.instagram.com/marastoni.luca/" },
  { label: "GitHub", link: "https://github.com/lucamarastoni" },
];

export default function App() {
  return (
    <>
      <ShaderGradientBackground />
      <div className="vignette-bg" aria-hidden="true" />
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials
        displayItemNumbering
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={false}
        colors={["#1f1f1f", "#090909"]}
        logoText={"Luca Marastoni\nDigital Solutions"}
        accentColor="#ffffff"
        isFixed
      />
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
