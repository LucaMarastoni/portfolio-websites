import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import homeBodyRaw from "../content/home-body.html?raw";
import { withBaseAssetPaths } from "../utils/legacyHtml";

const homeBody = withBaseAssetPaths(
  homeBodyRaw
  .replace(/<canvas id="stars-bg"[^>]*><\/canvas>\s*/i, "")
  .replace(/<script[^>]*src="\.\/assets\/stars-bg\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<script[^>]*src="\.\/scripts\.js"[^>]*><\/script>\s*/i, "")
  .replace(/href="crm\.html"/g, 'href="#/crm"')
  .replace(/href="#(?!\/)([^"]+)"/g, 'href="#/?section=$1"'),
);

const scrollToRequestedSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
};

export default function Home() {
  const location = useLocation();

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

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
