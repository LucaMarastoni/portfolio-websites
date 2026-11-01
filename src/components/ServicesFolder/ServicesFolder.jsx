import { useEffect, useMemo, useState } from "react";
import Folder from "../Folder";
import "./services-folder.css";

const services = [
  {
    title: "Siti e landing orientati al contatto",
    lead: "Pagine veloci, chiare e progettate per convertire.",
    points: ["Performance e SEO tecnica", "Struttura persuasiva", "Tracking eventi"],
    href: "#/?section=project-albatros",
  },
  {
    title: "Google Ads con focus sui lead utili",
    lead: "Campagne Search e Local con obiettivi misurabili.",
    points: ["Keyword e annunci", "Misurazione affidabile", "Ottimizzazione continua"],
    href: "#/?section=project-pizzaparty",
    badge: true,
  },
  {
    title: "CRM su misura per processi reali",
    lead: "Flussi operativi costruiti intorno al tuo lavoro.",
    points: ["Pipeline e task", "Automazioni utili", "Dashboard operative"],
    href: "#/?section=project-piuma",
  },
];

function useFolderLayout() {
  const [viewport, setViewport] = useState(() => ({
    compact: window.matchMedia("(max-width: 680px)").matches,
    medium: window.matchMedia("(max-width: 980px)").matches,
  }));

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 680px)");
    const mediumQuery = window.matchMedia("(max-width: 980px)");
    const sync = () => {
      setViewport({ compact: compactQuery.matches, medium: mediumQuery.matches });
    };
    compactQuery.addEventListener("change", sync);
    mediumQuery.addEventListener("change", sync);
    return () => {
      compactQuery.removeEventListener("change", sync);
      mediumQuery.removeEventListener("change", sync);
    };
  }, []);

  return {
    layout: "spread",
    size: viewport.compact ? 1 : viewport.medium ? 1.55 : 2,
  };
}

export default function ServicesFolder() {
  const { layout, size } = useFolderLayout();
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");

  const items = useMemo(
    () =>
      services.map((service) => ({
        title: service.title,
        content: (
          <article className="services-folder-card">
            {service.badge ? (
              <img
                className="services-folder-card__badge"
                src={`${base}image/google-search-certified.png`}
                alt="Google Ads Certified"
                loading="lazy"
                decoding="async"
              />
            ) : null}
            <p className="services-folder-card__number">0{services.indexOf(service) + 1}</p>
            <h3>{service.title}</h3>
            <p className="services-folder-card__lead">{service.lead}</p>
            <ul>
              {service.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <a href={service.href} onClick={(event) => event.stopPropagation()}>
              Apri caso <span aria-hidden="true">↗</span>
            </a>
          </article>
        ),
      })),
    [base],
  );

  return (
    <div className="services-folder">
      <header className="services-folder__heading">
        <p className="eyebrow">Servizi</p>
        <h2>Cosa possiamo costruire per te</h2>
        <p>Soluzioni su misura per prodotto digitale, operatività interna e acquisizione clienti.</p>
      </header>

      <div className="services-folder__stage">
        <Folder
          label="Servizi"
          items={items}
          mode="flap"
          variant="glass"
          layout={layout}
          color="#d8d8d8"
          paperColor="#ffffff"
          tabPosition="right"
          openOn="click"
          size={size}
          frost={0.35}
          tilt={0.45}
          speed={1}
          bounce={0.42}
          peek
          intro
          draggable
          zoomOnClick
          theme="dark"
        />
      </div>
      <p className="services-folder__hint">Apri la cartella e seleziona un servizio</p>
    </div>
  );
}
