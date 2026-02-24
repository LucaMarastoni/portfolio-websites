export type ProjectCategory =
  | "Ristorazione"
  | "Turismo"
  | "Community"
  | "Artigianato"
  | "Software"
  | "Intrattenimento"
  | "Streetwear";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  cover: string;
  coverAlt: string;
  description: string;
  tags: string[];
  ctaLabel?: string;
  url?: string;
  caseStudyHref?: string;
  highlight?: string;
  featured?: boolean;
};

const withBase = (path: string): string => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
  return `${base}${path.replace(/^\//, "")}`;
};

export const projects: Project[] = [
  {
    id: "piuma-crm",
    title: "Piuma | CRM per la ristorazione",
    category: "Software",
    cover: withBase("image/software.png"),
    coverAlt: "Anteprima CRM Piuma per pizzerie take-away e delivery",
    description:
      "Piuma e il gestionale cassa leggero per pizzerie take-away e delivery: componi pizze al volo, controlla ingredienti extra, coordina i rider e lavori anche senza connessione.",
    tags: ["Ordini e comande", "Gestione ingredienti", "Tracking rider"],
    caseStudyHref: "#case-study-piuma",
    highlight: "Flussi guidati per ordini e delivery planner anche offline.",
    featured: true,
  },
  {
    id: "albatros-tropea",
    title: "Albatros Tropea Noleggio",
    category: "Turismo",
    cover: withBase("logos/albatros_logo.png"),
    coverAlt: "Brand Albatros Tropea Noleggio",
    description:
      "Portale per il noleggio gommoni ed escursioni a Tropea con booking online integrato, pagine servizio ottimizzate e gestione richieste semplificata per lo staff.",
    tags: ["Booking engine", "Landing multilingua", "Lead automation"],
    url: "https://lucamarastoni.github.io/Albatros-Tropea-Noleggio/",
    caseStudyHref: "#case-study-albatros",
    highlight: "Booking online integrato con gestione richieste semplificata.",
  },
  {
    id: "pizza-party-vr",
    title: "Pizza Party VR",
    category: "Ristorazione",
    cover: withBase("logos/pizzaparty_logo.png"),
    coverAlt: "Brand Pizza Party VR",
    description:
      "Ecosistema digitale per una pizzeria veronese: nuova identita, menu stagionale interattivo, prenotazioni integrate e campagne Google Ads geolocalizzate.",
    tags: ["Brand identity", "Menu digitale", "Google Ads locali"],
    url: "https://www.pizzapartyvr.it",
    caseStudyHref: "#case-study-pizza-party",
    highlight: "Prenotazioni integrate e campagne locali coordinate.",
  },
  {
    id: "miclab",
    title: "MICLAB",
    category: "Intrattenimento",
    cover: withBase("logos/miclab_logo.jpg"),
    coverAlt: "Brand MICLAB",
    description:
      "Format musicale episodico lanciato come una serie: storytelling coordinato, teaser video, lore dedicata e distribuzione multi-piattaforma.",
    tags: ["Sound design", "Storytelling", "Landing episodica"],
    url: "https://miclab.it",
    caseStudyHref: "#case-study-miclab",
    highlight: "Distribuzione multi-piattaforma con storytelling episodico.",
  },
  {
    id: "terra-sushi",
    title: "Terra Sushi",
    category: "Ristorazione",
    cover: withBase("logos/terrasushi_logo.png"),
    coverAlt: "Brand Terra Sushi",
    description:
      "Sito vetrina per ristorante sushi, con struttura orientata alla prenotazione e una presentazione chiara di menu, location e contatti.",
    tags: ["Brand identity", "Menu in evidenza", "Prenotazioni rapide"],
    url: "https://terrasushivr.it",
    caseStudyHref: "#case-study-terra-sushi",
    highlight: "Percorso orientato alla prenotazione con menu e contatti chiari.",
  },
  {
    id: "37100-club",
    title: "37100 Club",
    category: "Community",
    cover: withBase("logos/37100club_logo.jpeg"),
    coverAlt: "Brand 37100 Club",
    description:
      "Piattaforma community con calendario eventi, ticketing dedicato, marketplace dell'usato e gamification per tenere viva la partecipazione.",
    tags: ["Gestione eventi", "Marketplace circolare", "Meccaniche di gioco"],
    url: "https://37100club.it",
    caseStudyHref: "#case-study-37100-club",
    highlight: "Calendario eventi e ticketing in un unico hub community.",
  },
  {
    id: "martylab",
    title: "Martylab",
    category: "Artigianato",
    cover: withBase("logos/martylab_logo.jpg"),
    coverAlt: "Brand Martylab",
    description:
      "Esperienza digitale per un laboratorio artigianale che incide a mano legno, vetro e acciaio: storytelling, catalogo e richieste personalizzate in un unico flusso.",
    tags: ["Shop personalizzato", "Gallery prodotto", "Richieste su misura"],
    url: "https://martylab.it",
    caseStudyHref: "#case-study-martylab",
    highlight: "Richieste personalizzate centralizzate in un flusso unico.",
  },
  {
    id: "vaulted",
    title: "Vaulted",
    category: "Streetwear",
    cover: withBase("logos/vaulted_logo.png"),
    coverAlt: "Brand Vaulted",
    description:
      "Sito vetrina per un brand streetwear indipendente, carosello dei modelli e reindirizzamento all'acquisto.",
    tags: ["Lookbook editoriale", "Calendario drop", "Lead wholesale"],
    url: "https://lucamarastoni.github.io/Vaulted/",
    caseStudyHref: "#case-study-vaulted",
    highlight: "Lookbook editoriale con percorso diretto verso l'acquisto.",
  },
];
