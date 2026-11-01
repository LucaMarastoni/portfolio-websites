import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowUpRight02Icon from "@hugeicons/core-free-icons/ArrowUpRight02Icon";
import SwipeRight01Icon from "@hugeicons/core-free-icons/SwipeRight01Icon";
import { projects, type Project } from "../../data/projects";
import CardSwap, { Card, type CardSwapHandle } from "./CardSwap";
import "./projects-swap.css";

const isExternalHref = (href?: string) => Boolean(href && /^(https?:)?\/\//.test(href));

function ProjectSwapCard({ project, active }: { project: Project; active: boolean }) {
  const href = project.url ?? project.caseStudyHref;
  const external = isExternalHref(href);
  const [allowVideo, setAllowVideo] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowVideo(!query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  const showVideo = active && allowVideo && Boolean(project.previewVideo);
  const poster = project.previewPoster ?? project.cover;

  return (
    <Card className="project-swap-card" id={project.id} aria-label={project.title}>
      <div className="project-swap-card__media">
        {showVideo ? (
          <video autoPlay muted playsInline loop preload="metadata" poster={poster} aria-hidden="true">
            <source src={project.previewVideo} type="video/mp4" />
          </video>
        ) : (
          <img src={poster} alt={project.coverAlt} loading={active ? "eager" : "lazy"} decoding="async" draggable={false} />
        )}
      </div>

      <div className="project-swap-card__scrim" aria-hidden="true" />
      <div className="project-swap-card__topline">
        <span>{project.category}</span>
        <span>{project.tags.slice(0, 2).join(" · ")}</span>
      </div>

      <div className="project-swap-card__content">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            tabIndex={active ? undefined : -1}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {project.ctaLabel ?? (project.url ? "Visita il sito" : "Scopri il progetto")}
            <HugeiconsIcon icon={ArrowUpRight02Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </Card>
  );
}

export function ProjectsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<CardSwapHandle>(null);

  return (
    <section className="projects-swap" aria-labelledby="projects-title">
      <div className="projects-swap__intro">
        <div>
          <p className="projects-swap__eyebrow">Case study</p>
          <h2 id="projects-title">Progetti reali, risultati concreti</h2>
          <p className="projects-swap__subtitle">
            Esplora i lavori trascinando la card in primo piano o usando le frecce.
          </p>
        </div>

        <div className="projects-swap__controls">
          <span className="projects-swap__gesture">
            <HugeiconsIcon icon={SwipeRight01Icon} size={18} strokeWidth={1.7} aria-hidden="true" />
            Trascina
          </span>
          <button type="button" onClick={() => carouselRef.current?.prev()} aria-label="Progetto precedente">←</button>
          <button type="button" onClick={() => carouselRef.current?.next()} aria-label="Progetto successivo">→</button>
        </div>
      </div>

      <CardSwap
        ref={carouselRef}
        width={760}
        height={500}
        cardDistance={58}
        verticalDistance={52}
        depth={90}
        skewAmount={3}
        visibleCards={4}
        cardRadius={24}
        delay={4500}
        speed={1}
        bounce={0.35}
        parallax={0.5}
        hoverSpread={0.12}
        dim={0.5}
        autoplay
        pauseOnHover
        draggable
        onChange={setActiveIndex}
        ariaLabel="Progetti del portfolio"
      >
        {projects.map((project, index) => (
          <ProjectSwapCard key={project.id} project={project} active={index === activeIndex} />
        ))}
      </CardSwap>
    </section>
  );
}
