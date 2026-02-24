import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import crmBodyRaw from "../content/crm-body.html?raw";
import { withBaseAssetPaths } from "../utils/legacyHtml";

const crmBody = withBaseAssetPaths(
  crmBodyRaw
  .replace(/<canvas id="stars-bg"[^>]*><\/canvas>\s*/i, "")
  .replace(/<script[^>]*src="\.\/assets\/stars-bg\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<script[^>]*src="\.\/scripts\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<header class="header">[\s\S]*?<\/header>\s*/i, "")
  .replace(/href="index\.html#([^"]+)"/g, 'href="#/?section=$1"')
  .replace(/href="index\.html"/g, 'href="#/"')
  .replace(/href="#(?!\/)([^"]+)"/g, 'href="#/crm?section=$1"')
  .replace(/href="crm\.html"/g, 'href="#/crm"'),
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

export default function CRM() {
  const location = useLocation();

  const html = useMemo(() => crmBody, []);

  useEffect(() => {
    document.body.classList.add("crm-page");
    document.title = "CRM Ristorazione | Luca Marastoni Digital Solution";

    return () => {
      document.body.classList.remove("crm-page");
    };
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
