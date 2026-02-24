import type { Project } from "../../data/projects";

type ProjectCardProps = {
  project: Project;
};

const isExternalHref = (href?: string) => Boolean(href && /^(https?:)?\/\//.test(href));

export function ProjectCard({ project }: ProjectCardProps) {
  const href = project.url ?? project.caseStudyHref;
  const ctaLabel = project.ctaLabel ?? (project.url ? "Visita il sito" : "Vedi progetto");
  const external = isExternalHref(href);

  return (
    <article className="project-card">
      <div className="project-card__media-wrap">
        <img
          className="project-card__media"
          src={project.cover}
          alt={project.coverAlt}
          loading="lazy"
          decoding="async"
        />
        <span className="project-card__category">{project.category}</span>
      </div>

      <div className="project-card__content">
        <h3>{project.title}</h3>
        <p className="project-card__description">{project.description}</p>

        <ul className="project-card__tags">
          {project.tags.slice(0, 3).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>

        {project.highlight ? (
          <p className="project-card__result">
            <span>Risultato</span>
            {project.highlight}
          </p>
        ) : null}

        {href ? (
          <a
            className="project-card__cta"
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}
