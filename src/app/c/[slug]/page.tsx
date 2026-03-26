import Image from "next/image";
import SortSelect from "@/components/SortSelect";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { ooProductsPaged } from "@/lib/woo";
import { formatDual } from "@/lib/price";
import { getPromoDisplayPrice } from "@/lib/promo";

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

type SearchParams = {
  page?: string;
  sort?: string;
  sub?: string;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asPosInt(v: unknown, fallback = 1) {
  const n = Number(asString(v));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function ensureEncodedSlug(s: string) {
  return /%[0-9a-fA-F]{2}/.test(s) ? s : encodeURIComponent(s);
}

function decodeSlugSafe(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function slugToTitle(slug: string) {
  return slug.replace(/-/g, " ").replace(/^\p{L}/u, (m) => m.toUpperCase());
}

function getCategorySeo(slug: string) {
  const decoded = decodeSlugSafe(slug).toLowerCase();

  const seoMap: Record<
    string,
    {
      title: string;
      description: string;
      h2: string;
      intro: string[];
    }
  > = {
    "диоптрични-рамки": {
      title: "Диоптрични рамки | OnlineOptica",
      description:
        "Диоптрични рамки за мъже, жени и деца. Голям избор от модерни модели, безплатен монтаж на стъклата и безплатна доставка до офис на Speedy.",
      h2: "Диоптрични рамки онлайн",
      intro: [
        "В OnlineOptica ще откриете богат избор от диоптрични рамки за мъже, жени и деца. Подбираме модели с модерен дизайн, удобна конструкция и добър баланс между визия, комфорт и цена.",
        "При нас можете да изберете както класически, така и по-съвременни форми, подходящи за ежедневно носене, работа, шофиране и по-активен начин на живот. Рамките са съвместими с различни видове диоптрични стъкла според вашите нужди.",
        "Поръчката е лесна и удобна, а към нея получавате безплатен монтаж на стъклата и безплатна доставка до офис на Speedy. Така можете спокойно да изберете подходящ модел онлайн и да получите готовите си очила бързо и сигурно.",
      ],
    },
    "слънчеви-очила": {
      title: "Слънчеви очила | OnlineOptica",
      description:
        "Слънчеви очила за мъже и жени с модерен дизайн и UV защита. Разгледайте актуални модели онлайн с бърза доставка.",
      h2: "Слънчеви очила онлайн",
      intro: [
        "В OnlineOptica ще откриете слънчеви очила за жени и мъже, подбрани с внимание към стила, удобството и ежедневната защита на очите. Предлагаме модели с модерни форми и визия, подходящи както за града, така и за пътуване и свободно време.",
        "Правилният избор на слънчеви очила не е само въпрос на дизайн, а и на комфорт при носене и защита от слънчевите лъчи. Затова в нашата селекция включваме модели, които съчетават добър външен вид и практичност.",
        "Пазаруването онлайн ви дава възможност бързо да сравните различни модели и да откриете най-подходящите слънчеви очила за вашия стил. Разгледайте наличните предложения и поръчайте удобно от OnlineOptica.",
      ],
    },
    "промоции": {
      title: "Промоции | OnlineOptica",
      description:
        "Разгледайте актуалните промоции в OnlineOptica. Изгодни предложения за рамки и очила с бърза доставка.",
      h2: "Промоции и изгодни предложения",
      intro: [
        "В категория Промоции ще откриете подбрани предложения на специални цени. Това е мястото, където можете да намерите качествени модели на по-изгодна стойност.",
        "Следим за добър баланс между цена, визия и практичност, за да предложим продукти, които си заслужават както като стил, така и като стойност.",
        "Проверявайте редовно категорията, за да не пропуснете актуалните оферти и сезонни намаления в OnlineOptica.",
      ],
    },
  };

  return (
    seoMap[decoded] || {
      title: `${slugToTitle(decoded)} | OnlineOptica`,
      description: `Разгледайте ${slugToTitle(decoded).toLowerCase()} в OnlineOptica с удобна онлайн поръчка и бърза доставка.`,
      h2: `${slugToTitle(decoded)} онлайн`,
      intro: [
        `Разгледайте ${slugToTitle(decoded).toLowerCase()} в OnlineOptica.`,
        "Подбираме модели с внимание към качество, комфорт и добър външен вид.",
        "Поръчайте удобно онлайн и изберете подходящ продукт според вашия стил и нужди.",
      ],
    }
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const seo = getCategorySeo(slug);

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/c/${slug}`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `/c/${slug}`,
      siteName: "OnlineOptica",
      type: "website",
    },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const { slug } = await props.params;
  const sp = props.searchParams ? await props.searchParams : {};

  const page = asPosInt((sp as any)?.page, 1);
  const sort = asString((sp as any)?.sort) || "new";
  const sub = asString((sp as any)?.sub);

  let displaySlug = slug;
  try {
    displaySlug = decodeURIComponent(displaySlug);
  } catch {}

  const slugNormalized = displaySlug.toLowerCase();
  const apiSlug = ensureEncodedSlug(slug);
  const activeSlug = sub ? encodeURIComponent(sub) : apiSlug;

  const { data: products, totalPages } = await ooProductsPaged<WooProduct[]>({
    per_page: 16,
    page,
    category_slug: activeSlug,
    sort,
  });

  const productsWithPromo = await Promise.all(
    products.map(async (p) => ({
      p,
      promo: await getPromoDisplayPrice(p),
    }))
  );

  const title = slugToTitle(displaySlug);
  const baseUrl = `/c/${slug}`;
  const seo = getCategorySeo(sub || slug);

  let subFilters: { label: string; slug: string }[] = [];

  if (slugNormalized === "диоптрични-рамки") {
    subFilters = [
      { label: "Дамски", slug: "дамски-рамки" },
      { label: "Мъжки", slug: "мъжки-рамки" },
      { label: "Детски", slug: "детски-рамки" },
    ];
  }

  if (slugNormalized === "слънчеви-очила") {
    subFilters = [
      { label: "Дамски", slug: "дамски-слънчеви-очила" },
      { label: "Мъжки", slug: "мъжки-слънчеви-очила" },
    ];
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Начало",
        item: "https://onlineoptica.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: `https://onlineoptica.com${baseUrl}`,
      },
      ...(sub
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: slugToTitle(sub),
              item: `https://onlineoptica.com${baseUrl}?sub=${encodeURIComponent(sub)}`,
            },
          ]
        : []),
    ],
  };

  return (
    <main className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="cat-hero">
        <div className="cat-hero-top">
          <h1 className="cat-title">{title}</h1>

          <div className="cat-sort">
            <span>Сортиране:</span>
            <SortSelect value={sort} baseUrl={baseUrl} />
          </div>
        </div>

        {subFilters.length > 0 && (
          <div className="filter-row">
            <div className="filter-scroll">
              <Link
                href={`${baseUrl}${sort ? `?sort=${sort}` : ""}`}
                className={!sub ? "filter-chip active" : "filter-chip"}
              >
                Всички
              </Link>

              {subFilters.map((f) => (
                <Link
                  key={f.slug}
                  href={`${baseUrl}?sub=${f.slug}${sort ? `&sort=${sort}` : ""}`}
                  className={sub === f.slug ? "filter-chip active" : "filter-chip"}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="products-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productsWithPromo.map(({ p, promo }) => (
          <Link key={p.id} href={`/p/${p.id}`} className="card">
            <div className="pmedia">
              {p.images?.[0]?.src && (
                <Image
                  src={p.images[0].src}
                  alt={p.images[0].alt || p.name}
                  width={500}
                  height={625}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}

              {promo.hasDiscount && promo.discountPercent && (
                <span className="promo-badge">-{promo.discountPercent}%</span>
              )}

              {promo.hasDiscount && promo.regular !== null && (
                <span className="pprice-strike">
                  {formatDual(String(promo.regular))}
                </span>
              )}

              <span className="pprice">
                {promo.final !== null ? formatDual(String(promo.final)) : ""}
              </span>
            </div>

            <div className="pname">{p.name}</div>
          </Link>
        ))}
      </div>

      <Pagination
        basePath={baseUrl}
        currentPage={page}
        totalPages={Math.max(totalPages, 1)}
        query={{ sort, sub }}
      />

      <section className="cat-seo">
        <h2>{seo.h2}</h2>
        {seo.intro.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </section>
    </main>
  );
}
