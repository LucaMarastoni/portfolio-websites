import { useMemo } from "react";
import "./ContactSection.css";

const EMAIL = "marastoni311@gmail.com";
const WHATSAPP_HREF = "https://wa.me/393486646762";

export default function ContactSection() {
  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Nuovo progetto digitale");
    const body = encodeURIComponent(
      "Ciao, ti contatto per parlare di un progetto su sito/CRM/Google Ads.\n\nObiettivo:\nTempistiche:\nBudget indicativo:\n",
    );
    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  }, []);

  return (
    <section className="contact-showcase" aria-label="Sezione contatti">
      <div className="contact-showcase__content">
        <h2>Parliamo del tuo progetto.</h2>

        <div className="contact-showcase__actions">
          <a
            className="contact-showcase__btn contact-showcase__btn--primary"
            href={mailtoHref}
            aria-label={`Scrivi una mail a ${EMAIL}`}
          >
            Mail
          </a>
          <a
            className="contact-showcase__btn contact-showcase__btn--ghost"
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
