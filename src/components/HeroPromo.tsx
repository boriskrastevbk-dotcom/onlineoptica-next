"use client";

import { useRouter } from "next/navigation";

export default function HeroPromo() {
  const router = useRouter();

  return (
    <section className="hero-promo">
      <div className="hero-content">
        <h1>
          Диоптрични рамки от <span>€16</span>
        </h1>

        <p className="hero-sub">
          −10% отстъпка до 29.03
        </p>

        <ul>
          <li>Стъкла от €25</li>
          <li>Безплатен монтаж</li>
          <li>Безплатна доставка до офис на Speedy</li>
        </ul>

        <button onClick={() => router.push("/c/dioptrichni-ramki")}>
          Разгледай рамките
        </button>
      </div>
    </section>
  );
}
