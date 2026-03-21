type WooCategory = {
  id?: number;
  name?: string;
  slug: string;
};

type PriceInput = {
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  categories?: WooCategory[];
};

type PromoConfig = {
  enabled: boolean;
  percent: number;
  start: string;
  end: string;
  categories: string[];
  active?: boolean;
  notice?: string;
};

export type PromoDisplayPrice = {
  regular: number | null;
  final: number | null;
  hasDiscount: boolean;
  discountPercent: number | null;
  source: "sale" | "promo" | "regular";
};

function toNumber(value?: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

let promoCache: PromoConfig | null = null;

async function getPromoConfig(): Promise<PromoConfig | null> {
  if (promoCache) return promoCache;

  try {
    const baseUrl = process.env.WOO_BASE_URL;
    if (!baseUrl) return null;

    const res = await fetch(`${baseUrl}/wp-json/onlineoptica/v1/promo`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as PromoConfig;

    promoCache = {
      enabled: Boolean(data.enabled),
      percent: Number(data.percent || 0),
      start: data.start || "",
      end: data.end || "",
      categories: Array.isArray(data.categories) ? data.categories.map(normalizeSlug) : [],
      active: Boolean(data.active),
      notice: data.notice || "",
    };

    return promoCache;
  } catch {
    return null;
  }
}

function isPromoActive(config: PromoConfig): boolean {
  if (!config.enabled) return false;
  if (config.active === true) return true;

  const start = config.start ? new Date(config.start).getTime() : NaN;
  const end = config.end ? new Date(config.end).getTime() : NaN;
  const now = Date.now();

  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;

  return now >= start && now <= end;
}

function isPromoCategory(product: PriceInput, config: PromoConfig): boolean {
  const wanted = new Set(config.categories.map(normalizeSlug));
  return (product.categories || []).some((c) => wanted.has(normalizeSlug(c.slug)));
}

export async function getPromoDisplayPrice(product: PriceInput): Promise<PromoDisplayPrice> {
  const regular = toNumber(product.regular_price);
  const sale = toNumber(product.sale_price);

  if (regular && sale && sale < regular) {
    return {
      regular,
      final: sale,
      hasDiscount: true,
      discountPercent: Math.round(((regular - sale) / regular) * 100),
      source: "sale",
    };
  }

  const config = await getPromoConfig();

  if (
    regular &&
    config &&
    isPromoActive(config) &&
    isPromoCategory(product, config) &&
    config.percent > 0
  ) {
    const final = Number((regular * (1 - config.percent / 100)).toFixed(2));

    return {
      regular,
      final,
      hasDiscount: true,
      discountPercent: config.percent,
      source: "promo",
    };
  }

  return {
    regular,
    final: regular ?? toNumber(product.price),
    hasDiscount: false,
    discountPercent: null,
    source: "regular",
  };
}
