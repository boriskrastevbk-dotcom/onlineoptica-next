import CategoryCards from "@/components/CategoryCards";
import ProductCard from "@/components/ProductCard";
import { ooProductsPaged } from "@/lib/woo";
import Link from "next/link";

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  on_sale: boolean;
  regular_price: string;
  sale_price: string;
  images?: { src: string; alt?: string }[];
};

export default async function Page() {
  const { data: products } = await ooProductsPaged<WooProduct[]>({
    per_page: 8,
    page: 1,
    sort: "new",
  });

  return (
    <>
      <section className="hero">
        <img className="hero-img" src="/hero.png" alt="Диоптрични очила" />

        <div className="hero-overlay">
          <div className="hero-inner">
            <div className="hero-text-group">

              <h1 className="hero-title">
                Диоптрични рамки от
                <span className="hero-price-highlight">€15</span>
              </h1>

              <p className="hero-sub">
                Стъкла от €25
                <br />
                Безплатен монтаж
                <br />
                Безплатна доставка до офис на Speedy
              </p>

            </div>
          </div>
        </div>
      </section>

      <main className="container">
        <CategoryCards />

        <section className="section-intro">
          <h2 className="section-title">Най-нови модели</h2>
          <p className="section-sub">Последните диоптрични рамки в нашата колекция</p>
        </section>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </main>
    </>
  );
}
