import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import ContactSection from "../components/Contact/ContactSection";
import ProcessCascade from "../components/ProcessCascade/ProcessCascade";
import { ProjectsSection } from "../components/Projects/ProjectsSection";
import RotatingText from "../components/TextType/RotatingText";
import TextType from "../components/TextType";
import ServicesFolder from "../components/ServicesFolder/ServicesFolder";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import homeBodyRaw from "../content/home-body.html?raw";
import { withBaseAssetPaths } from "../utils/legacyHtml";

const homeBody = withBaseAssetPaths(
  homeBodyRaw
  .replace(/<span\s+class="swap-word"[\s\S]*?<\/span>/i, '<span id="hero-texttype-root" class="text-type-slot"></span>')
  .replace(/<canvas id="stars-bg"[^>]*><\/canvas>\s*/i, "")
  .replace(/<script[^>]*src="\.\/assets\/stars-bg\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<script[^>]*src="\.\/scripts\.js"[^>]*><\/script>\s*/i, "")
  .replace(/<header class="header">[\s\S]*?<\/header>\s*/i, "")
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
  const [subtitleRevealMount, setSubtitleRevealMount] = useState(null);
  const [processCascadeMount, setProcessCascadeMount] = useState(null);
  const [projectsSectionMount, setProjectsSectionMount] = useState(null);
  const [contactSectionMount, setContactSectionMount] = useState(null);
  const [projectsButtonMount, setProjectsButtonMount] = useState(null);
  const [servicesFolderMount, setServicesFolderMount] = useState(null);

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
    setSubtitleRevealMount(document.getElementById("hero-scroll-reveal-root"));
    setProcessCascadeMount(document.getElementById("process-scroll-triggered-root"));
    setProjectsSectionMount(document.getElementById("projects-section-root"));
    setContactSectionMount(document.getElementById("contact-section-root"));
    setProjectsButtonMount(document.getElementById("hero-projects-button-root"));
    setServicesFolderMount(document.getElementById("services-folder-root"));
  }, [html, location.pathname]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {projectsButtonMount
        ? createPortal(
            <LiquidButton asChild className="hero-projects-button">
              <a href="#/?section=progetti">Scopri i progetti</a>
            </LiquidButton>,
            projectsButtonMount,
          )
        : null}
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
      {servicesFolderMount
        ? createPortal(<ServicesFolder />, servicesFolderMount)
        : null}
      {subtitleRevealMount
        ? createPortal(
            <TextType
              as="p"
              className="hero-texttype-copy"
              text={["Non ci limitiamo a portare i brand online. Creiamo esperienze digitali e strategie su misura che trasformano le idee in opportunità concrete di crescita."]}
              typingSpeed={18}
              initialDelay={250}
              loop={false}
              typeEffect="none"
              showCursor
              cursorStyle="bar"
              cursorGlide
              cursorColor="rgba(255, 255, 255, 0.78)"
              cursorBlinkDuration={0.55}
              startOnVisible
            />,
            subtitleRevealMount,
          )
        : null}
      {processCascadeMount
        ? createPortal(<ProcessCascade />, processCascadeMount)
        : null}
      {projectsSectionMount
        ? createPortal(<ProjectsSection />, projectsSectionMount)
        : null}
      {contactSectionMount
        ? createPortal(<ContactSection />, contactSectionMount)
        : null}
    </>
  );
}
