import { useMemo, useState } from "react";
import { projects } from "../../data/projects";
import { ProjectCard } from "./ProjectCard";
import "./projects.css";

const INITIAL_VISIBLE_COUNT = 3;

export function ProjectsSection() {
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  const visibleProjects = useMemo(
    () => projects.slice(0, visibleCount),
    [visibleCount],
  );

  const hasMoreProjects = projects.length > visibleCount;

  const showAllProjects = () => {
    setVisibleCount(projects.length);
  };

  return (
    <section className="projects-section" aria-labelledby="projects-title">
      <div className="projects-section__inner">
        <header className="projects-section__header">
          <p className="projects-section__eyebrow">Case study</p>
          <h2 id="projects-title">Progetti reali, risultati concreti</h2>
          <p className="projects-section__subtitle">
            Selezioniamo solo i lavori che raccontano bene metodo, esecuzione e impatto operativo.
          </p>
        </header>

        <div className="projects-grid" aria-live="polite">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {hasMoreProjects ? (
          <div className="projects-load-more-wrap">
            <button
              type="button"
              className="projects-load-more"
              onClick={showAllProjects}
            >
              Mostra altri case study
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
