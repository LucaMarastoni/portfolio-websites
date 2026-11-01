import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { projects } from "../../data/projects";
import "./ProjectCarousel.css";

export function ProjectCarousel() {
  const [mainViewportRef, mainApi] = useEmblaCarousel({ loop: true });
  const [thumbViewportRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi],
  );

  const onSelect = useCallback(() => {
    if (!mainApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelectedIndex(index);
    thumbApi?.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
      mainApi.off("reInit", onSelect);
    };
  }, [mainApi, onSelect]);

  useEffect(() => {
    if (!mainApi || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => mainApi.scrollNext(), 3000);
    return () => window.clearInterval(timer);
  }, [mainApi]);

  return (
    <div className="project-carousel">
      <div className="project-carousel__frame">
        <div className="project-carousel__viewport" ref={mainViewportRef}>
          <div className="project-carousel__track">
            {projects.map((project, index) => {
              const poster = project.previewPoster ?? project.cover;
              const active = index === selectedIndex;
              const href = project.url ?? (project.caseStudyHref === "#contact"
                ? "#/?section=contact"
                : project.caseStudyHref);
              const external = Boolean(href && /^(https?:)?\/\//.test(href));

              return (
                <article
                  className="project-carousel__slide"
                  key={project.id}
                  aria-hidden={!active}
                >
                  <a
                    className="project-carousel__link"
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    tabIndex={active ? 0 : -1}
                    aria-label={`Apri il progetto ${project.title}`}
                  >
                    <div className="project-carousel__media">
                      {active && project.previewVideo ? (
                        <video
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          poster={poster}
                          aria-hidden="true"
                        >
                          <source src={project.previewVideo} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={poster}
                          alt={project.coverAlt}
                          loading={active ? "eager" : "lazy"}
                          decoding="async"
                          draggable={false}
                        />
                      )}
                    </div>

                    <div className="project-carousel__scrim" aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>

        <div className="project-carousel__thumbs-shell">
          <div className="project-carousel__thumbs-viewport" ref={thumbViewportRef}>
            <div className="project-carousel__thumbs-track">
              {projects.map((project, index) => {
                const poster = project.previewPoster ?? project.cover;
                const active = index === selectedIndex;

                return (
                  <button
                    type="button"
                    className={`project-carousel__thumb${active ? " is-active" : ""}`}
                    key={project.id}
                    onClick={() => onThumbClick(index)}
                    aria-label={`Mostra ${project.title}`}
                    aria-current={active ? "true" : undefined}
                  >
                    <img src={poster} alt="" loading="lazy" decoding="async" draggable={false} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCarousel;
