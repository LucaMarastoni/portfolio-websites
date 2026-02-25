import type { Project } from "../../data/projects";

type ProjectCardProps = {
  project: Project;
};

const isExternalHref = (href?: string) => Boolean(href && /^(https?:)?\/\//.test(href));
const toBriefText = (text: string, maxLength = 96): string => {
  if (text.length <= maxLength) return text;
  const shortened = text.slice(0, maxLength);
  const cutAt = shortened.lastIndexOf(" ");
  return `${(cutAt > 40 ? shortened.slice(0, cutAt) : shortened).trim()}...`;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const href = project.url ?? project.caseStudyHref;
  const ctaLabel = project.ctaLabel ?? (project.url ? "Visita il sito" : "Vedi progetto");
  const external = isExternalHref(href);
  const briefDescription = toBriefText(project.description);

  return (
    <article id={project.id} className="project-card">
      <div className="project-card__media-wrap">
        {project.previewVideo ? (
          <video
            className="project-card__media"
            autoPlay
            muted
            playsInline
            loop
            preload="metadata"
            poster={project.previewPoster ?? project.cover}
            aria-hidden="true"
          >
            <source src={project.previewVideo} type="video/mp4" />
            Il tuo browser non supporta i video HTML5.
          </video>
        ) : (
          <img
            className="project-card__media"
            src={project.cover}
            alt={project.coverAlt}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="project-card__content">
        <h3>{project.title}</h3>
        <p className="project-card__description">{briefDescription}</p>

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
