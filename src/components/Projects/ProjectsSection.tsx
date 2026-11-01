import { useMemo } from "react";
import { projects } from "../../data/projects";
import TiltedGridHero from "./TiltedGridHero";
import "./projects-tilted.css";

export function ProjectsSection() {
  const projectImages = useMemo(
    () =>
      projects.map((project) => ({
        src: project.previewPoster ?? project.cover,
        alt: project.coverAlt,
      })),
    [],
  );

  return (
    <section className="projects-swap projects-tilted" aria-labelledby="projects-title">
      <TiltedGridHero
        images={projectImages}
        speed={3.6}
        tileHeight={36}
        aspectRatio={16 / 9}
        gap={7}
        axis={56}
        curve={58}
        fade={10}
        className="projects-tilted__hero"
      >
        <div className="projects-swap__intro projects-tilted__intro">
          <div>
            <p className="projects-swap__eyebrow">Case study</p>
            <h2 id="projects-title">Progetti reali, risultati concreti</h2>
          </div>
        </div>

      </TiltedGridHero>
    </section>
  );
}
