import ProjectCarousel from "./ProjectCarousel";
import "./projects-tilted.css";

export function ProjectsSection() {
  return (
    <section className="projects-swap projects-tilted" aria-labelledby="projects-title">
      <div className="projects-swap__intro projects-tilted__intro">
        <div>
          <p className="projects-swap__eyebrow">Case study</p>
          <h2 id="projects-title">Progetti reali, risultati concreti</h2>
        </div>
      </div>

      <ProjectCarousel />
    </section>
  );
}
