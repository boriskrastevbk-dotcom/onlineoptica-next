import Link from "next/link";
import { wooGetProductById } from "@/lib/woo";
import ProductClientBox from "@/components/lens/ProductClientBox";
import ShortDescriptionClamp from "@/components/product/ShortDescriptionClamp";
import ProductImageZoom from "@/components/ProductImageZoom";
import { formatDual } from "@/lib/price";
import { getPromoDisplayPrice } from "@/lib/promo";

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  description?: string;
  short_description?: string;
  images?: { src: string; alt?: string }[];
  categories?: { id: number; name: string; slug: string }[];
};

function asNum(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function decodeSlug(s?: string) {
  if (!s) return "";
  try {
    return decodeURIComponent(s).toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

function stripHtml(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(text: string, max = 160) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function buildProductDescription(product: WooProduct) {
  const shortText = stripHtml(product.short_description);
  if (shortText) return truncate(shortText, 155);

  const descText = stripHtml(product.description);
  if (descText) return truncate(descText, 155);

  return truncate(
    `${product.name} в OnlineOptica. Разгледайте продукта онлайн с удобна поръчка и бърза доставка.`,
    155
  );
}

export default async function ProductByIdPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ img?: string }> | { img?: string };
}) {
  const { id } = await props.params;
  const sp = props.searchParams ? await props.searchParams : {};

  const idNum = Number(id);
  if (!Number.isFinite(idNum)) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Невалиден продукт.</h2>
      </main>
    );
  }

  const product = await wooGetProductById<WooProduct>(idNum);
  const promo = await getPromoDisplayPrice(product);
  const isSunglasses =
    product.categories?.some((cat) =>
      decodeSlug(cat.slug).includes("слънчеви-очила")
    ) ?? false;

  const imgs = Array.isArray(product.images) ? product.images : [];
  const imgIndex = Math.max(
    0,
    Math.min(imgs.length - 1, asNum((sp as any)?.img, 0))
  );
  const mainImg = imgs[imgIndex];

  const effectivePrice = promo.final ?? Number(product.price || "0");

  return (
    <main className="container" style={{ padding: 24 }}>

      <div
        className="oo-product-grid"
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "520px 1fr",
          gap: 18,
        }}
      >
        <section>
          {mainImg?.src ? (
            <ProductImageZoom
              key={`${product.id}-${imgIndex}`}
              images={imgs}
              initialIndex={imgIndex}
            />
          ) : null}
        </section>

        <section style={{ maxWidth: 520 }}>
          <h1 style={{ margin: "0 0 8px" }}>{product.name}</h1>

          {/* PREMIUM PRICE BLOCK */}
          <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 10 }}>
            {promo.hasDiscount && promo.regular !== null ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 26 }}>
                  {promo.final !== null
                    ? formatDual(String(promo.final))
                    : ""}
                </span>

                <span
                  style={{
                    textDecoration: "line-through",
                    opacity: 0.5,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  {formatDual(String(promo.regular))}
                </span>

                {promo.discountPercent ? (
                  <span
                    style={{
                      fontSize: 14,
                      opacity: 0.6,
                      fontWeight: 600,
                    }}
                  >
                    −{promo.discountPercent}%
                  </span>
                ) : null}
              </div>
            ) : (
              <span>{formatDual(product.price)}</span>
            )}
          </div>

          {product.short_description ? (
            <div
              style={{
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#fff",
                marginBottom: 12,
              }}
            >
              <ShortDescriptionClamp
                html={product.short_description}
                lines={4}
              />
            </div>
          ) : null}

          <ProductClientBox
            productId={product.id}
            name={product.name}
            price={effectivePrice}
            image={product.images?.[0]?.src}
            slug={product.slug}
          />
        </section>
      </div>



      <div
        style={{
          marginTop: 18,
          borderTop: "1px solid rgba(0,0,0,0.12)",
          paddingTop: 12,
        }}
      >
 {!isSunglasses && (
    <section
      style={{
        marginTop: 20,
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "#fff",
      }}
    >
      <h2 style={{ margin: "0 0 10px" }}>Информация за стъклата</h2>

      <div style={{ lineHeight: 1.7, opacity: 0.92 }}>
        <p>
          Към тази рамка можете да изберете различни видове стъкла според вашите нужди:
        </p>

        <ul style={{ marginTop: 10, paddingLeft: 18 }}>
          <li><b>Стандартни</b> – базов вариант без допълнителни покрития</li>
          <li><b>С антирефлекс (HMC)</b> – намаляват отблясъците и подобряват зрителния комфорт</li>
          <li><b>Blue Control</b> – филтър срещу синя светлина при работа с екрани</li>
          <li><b>Фотосоларни</b> – потъмняват автоматично на слънце</li>
          <li><b>Бързопотъмняващи Sensity</b> – по-бърза реакция и по-висок визуален комфорт</li>
          <li><b>ADDPOWER</b> – за интензивно четене и работа наблизо</li>
          <li><b>Оцветени UV400</b> – подходящи за диоптрични слънчеви очила</li>
        </ul>

        <p style={{ marginTop: 10 }}>
          Стандартният диапазон на корекция е до <b>±6.00 sph / ±2.00 cyl</b>.
        </p>

        <p style={{ marginTop: 8 }}>
          За по-високи диоптри или специфични изисквания, свържете се с нас за консултация.
        </p>
      </div>
    </section>
  )}
</div>


      <style>{`
        @media (max-width: 980px) {
          .oo-product-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
