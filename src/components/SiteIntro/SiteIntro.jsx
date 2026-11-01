import { useEffect, useState } from "react";
import logo from "../../../logo.png";
import "./SiteIntro.css";

export default function SiteIntro() {
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.classList.add("site-intro-visible");
    const exitTimer = window.setTimeout(() => setExiting(true), 2500);
    const removeTimer = window.setTimeout(() => setVisible(false), 3000);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      document.body.classList.remove("site-intro-visible");
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.classList.remove("site-intro-visible");
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`site-intro${exiting ? " is-exiting" : ""}`}
      role="status"
      aria-label="Caricamento del sito"
    >
      <img src={logo} alt="Luca Marastoni" />
    </div>
  );
}
