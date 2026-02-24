import { useMemo, useState } from "react";
import { projects, type Project } from "../../data/projects";
import { CategoryFilter } from "./CategoryFilter";
import { FeaturedProject } from "./FeaturedProject";
import { ProjectCard } from "./ProjectCard";
import "./projects.css";

const ALL_CATEGORY = "Tutti";
const PREFERRED_CATEGORY_ORDER: Project["category"][] = [
  "Ristorazione",
  "Turismo",
  "Community",
  "Artigianato",
  "Software",
  "Intrattenimento",
];

export function ProjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);

  const categories = useMemo(() => {
    const discovered = Array.from(new Set(projects.map((project) => project.category)));

    const preferred = PREFERRED_CATEGORY_ORDER.filter((category) => discovered.includes(category));
    const remaining = discovered
      .filter((category) => !PREFERRED_CATEGORY_ORDER.includes(category))
      .sort((a, b) => a.localeCompare(b));

    return [ALL_CATEGORY, ...preferred, ...remaining];
  }, []);

  const matchingProjects = useMemo(
    () =>
      selectedCategory === ALL_CATEGORY
        ? projects
        : projects.filter((project) => project.category === selectedCategory),
    [selectedCategory],
  );

  const featuredProject = useMemo(
    () => matchingProjects.find((project) => project.featured) ?? matchingProjects[0] ?? null,
    [matchingProjects],
  );

  const filteredProjects = useMemo(
    () =>
      featuredProject
        ? matchingProjects.filter((project) => project.id !== featuredProject.id)
        : matchingProjects,
    [featuredProject, matchingProjects],
  );

  return (
    <section id="progetti" className="projects-section" aria-labelledby="projects-title">
      <div className="projects-section__inner">
        <header className="projects-section__header">
          <p className="projects-section__eyebrow">Portfolio selezionato</p>
          <h2 id="projects-title">Progetti digitali che uniscono strategia, design e sviluppo</h2>
          <p className="projects-section__subtitle">
            Ogni lancio parte da KPI concreti condivisi con il cliente e si traduce in soluzioni
            scalabili, curate nei dettagli e supportate da acquisizione misurabile.
          </p>
        </header>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          sticky
        />

        {featuredProject ? <FeaturedProject project={featuredProject} /> : null}

        <div className="projects-grid" key={selectedCategory} aria-live="polite">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
