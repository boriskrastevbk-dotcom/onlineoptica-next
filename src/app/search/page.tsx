import SortSelect from "@/components/SortSelect";
import Link from "next/link";
import { ooProductsPaged } from "@/lib/woo";
import { getPromoDisplayPrice } from "@/lib/promo";
import { formatDual } from "@/lib/price";

type WooCategory = {
  id: number;
  name: string;
  slug: string;
};

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  categories?: WooCategory[];
  images?: { src: string; alt?: string }[];
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export default async function SearchPage(props: {
  searchParams?:
    | Promise<{ q?: string; page?: string; sort?: string }>
    | { q?: string; page?: string; sort?: string };
}) {
  const sp = props.searchParams ? await props.searchParams : {};
  const q = asString(sp?.q).trim();
  const page = Math.max(1, Number(asString(sp?.page) || "1"));
  const sort = asString((sp as any)?.sort) || "new";

  if (!q) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Търсене</h1>
        <p style={{ opacity: 0.8 }}>Въведи текст в полето за търсене горе.</p>
      </main>
    );
  }

  const { data: products, total, totalPages } = await ooProductsPaged<WooProduct[]>({
    per_page: 24,
    page,
    search: q,
    sort,
  });

  const productsWithPromo = await Promise.all(
    products.map(async (p) => ({
      p,
      promo: await getPromoDisplayPrice(p),
    }))
  );

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Резултати за: “{q}”</h1>

      <p style={{ opacity: 0.8, marginTop: 8 }}>
        Намерени: <b>{total}</b> • Страница <b>{page}</b> от{" "}
        <b>{Math.max(totalPages, 1)}</b>
      </p>

      <div style={{ marginTop: 10, marginBottom: 16 }}>
        <SortSelect value={sort} baseUrl={`/search?q=${encodeURIComponent(q)}`} />
      </div>

      {products.length === 0 ? (
        <p style={{ opacity: 0.8 }}>Няма намерени продукти.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 16,
          }}
        >
          {productsWithPromo.map(({ p, promo }) => (
            <Link
              key={p.id}
              href={`/p/${p.id}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {p.images?.[0]?.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0].src}
                  alt={p.images[0].alt || p.name}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                />
              )}

              <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.name}</div>

              <div style={{ fontWeight: 800 }}>
                {promo.hasDiscount && promo.regular !== null ? (
                  <>
                    <span
                      style={{
                        textDecoration: "line-through",
                        opacity: 0.7,
                        marginRight: 8,
                      }}
                    >
                      {formatDual(String(promo.regular))}
                    </span>
                    <span>
                      {promo.final !== null ? formatDual(String(promo.final)) : ""}
                    </span>
                  </>
                ) : (
                  <span>
                    {promo.final !== null ? formatDual(String(promo.final)) : ""}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 16 }}>
        {page > 1 && (
          <Link
            href={`/search?q=${encodeURIComponent(q)}&sort=${encodeURIComponent(sort)}&page=${page - 1}`}
          >
            ← Предишна
          </Link>
        )}
        <span>Страница {page}</span>
        {page < Math.max(totalPages, 1) && (
          <Link
            href={`/search?q=${encodeURIComponent(q)}&sort=${encodeURIComponent(sort)}&page=${page + 1}`}
          >
            Следваща →
          </Link>
        )}
      </div>
    </main>
  );
}
