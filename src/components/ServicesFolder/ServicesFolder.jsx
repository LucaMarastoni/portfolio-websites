import { useEffect, useMemo, useState } from "react";
import Folder from "../Folder";
import "./services-folder.css";

const services = [
  {
    title: "Siti e landing orientati al contatto",
    lead: "Esperienze veloci e credibili, costruite attorno a una sola azione: trasformare visite in richieste.",
    points: [
      "Architettura e copy persuasivi",
      "Design responsive su misura",
      "Performance, SEO e accessibilità",
      "Moduli, WhatsApp e prenotazioni",
      "Analytics e tracking degli eventi",
    ],
    result: "Una presenza digitale chiara, veloce e pronta a generare contatti.",
    ideal: "Brand, professionisti e attività locali.",
    cta: "Vedi progetto",
    href: "#/?section=project-albatros",
  },
  {
    title: "Google Ads con focus sui lead utili",
    lead: "Campagne Search e Local pensate per intercettare domanda reale e produrre contatti tracciabili.",
    points: [
      "Analisi di domanda e competitor",
      "Keyword, annunci e asset dedicati",
      "Landing e tracciamento conversioni",
      "Ottimizzazione di budget e ricerche",
      "Report leggibili e azioni successive",
    ],
    result: "Meno traffico dispersivo, più richieste con un costo sostenibile.",
    ideal: "Attività locali, servizi e lead generation B2B.",
    cta: "Vedi campagna",
    href: "#/?section=project-pizzaparty",
    badge: true,
  },
  {
    title: "CRM su misura per processi reali",
    lead: "Strumenti operativi disegnati sui tuoi flussi, senza funzioni inutili o processi imposti.",
    points: [
      "Mappatura del processo e priorità",
      "Pipeline, anagrafiche e task",
      "Automazioni, alert e follow-up",
      "Ruoli, permessi e dashboard",
      "Integrazioni con strumenti esistenti",
    ],
    result: "Meno passaggi manuali, dati ordinati e attività sempre sotto controllo.",
    ideal: "Team che gestiscono clienti, ordini o commesse.",
    cta: "Scopri il CRM",
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
            <div className="services-folder-card__details">
              <p><strong>Risultato</strong>{service.result}</p>
              <p><strong>Ideale per</strong>{service.ideal}</p>
            </div>
            <a href={service.href} onClick={(event) => event.stopPropagation()}>
              {service.cta} <span aria-hidden="true">↗</span>
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
