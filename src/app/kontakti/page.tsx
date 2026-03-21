// src/app/kontakti/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (

<main className="container policy contact-page">
      <header className="page-header">
        <h1>   Контакти</h1>
      </header>

      <div className="contact-content">
        <div className="contact-company">Оптика Естетика ЕООД</div>
        <div>гр. Русе</div>
        <div>ул. „Константин Иречек“ 26</div>
        <div>
          Телефон:{" "}
          <a className="contact-phone" href="tel:+359883339620">
            +359 883 339 620
          </a>
        </div>
      </div>
    </main>
  );
}
