import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import RotatingText from "../components/TextType/RotatingText";
import homeBodyRaw from "../content/home-body.html?raw";
import { withBaseAssetPaths } from "../utils/legacyHtml";

const homeBody = withBaseAssetPaths(
  homeBodyRaw
  .replace(/<span\s+class="swap-word"[\s\S]*?<\/span>/i, '<span id="hero-texttype-root" class="text-type-slot"></span>')
  .replace(/<canvas id="stars-bg"[^>]*><\/canvas>\s*/i, "")
  .replace(/<script[^>]*src="\.\/assets\/stars-bg\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<script[^>]*src="\.\/scripts\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<header class="header">[\s\S]*?<\/header>\s*/i, "")
  .replace(/href="crm\.html"/g, 'href="#/crm"')
  .replace(/href="#(?!\/)([^"]+)"/g, 'href="#/?section=$1"'),
);

const HEADER_OFFSET_PX = 72;

const scrollToRequestedSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const targetTop = Math.max(
    0,
    section.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX,
  );
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    window.scrollTo({ top: targetTop, behavior: "auto" });
    return;
  }

  window.scrollTo({ top: targetTop, behavior: "smooth" });
};

export default function Home() {
  const location = useLocation();
  const [titleTextMount, setTitleTextMount] = useState(null);

  const html = useMemo(() => homeBody, []);

  useEffect(() => {
    document.body.classList.remove("crm-page");
    document.title = "Luca Marastoni | Siti Web, CRM e Google Ads";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");

    if (section) {
      requestAnimationFrame(() => scrollToRequestedSection(section));
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.search]);

  useEffect(() => {
    setTitleTextMount(document.getElementById("hero-texttype-root"));
  }, [html, location.pathname]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {titleTextMount
        ? createPortal(
            <RotatingText
              texts={["WEB", "DIGITAL", "CRM", "ADS", "GROWTH"]}
              mainClassName="hero-rotating-text"
              splitLevelClassName="hero-rotating-word"
              elementLevelClassName="hero-rotating-char"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.02}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2200}
            />,
            titleTextMount,
          )
        : null}
    </>
  );
}
