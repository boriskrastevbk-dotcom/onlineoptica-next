type ProductCategory = {
  id?: number;
  slug: string;
  name?: string;
};

type PromoConfig = {
  enabled: boolean;
  percent: number;
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  categorySlugs: string[];
};

type PriceInput = {
  regular_price?: string;
  sale_price?: string;
  price?: string;
  categories?: ProductCategory[];
};

export type DisplayPriceResult = {
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

function isPromoActive(config: PromoConfig): boolean {
  if (!config.enabled) return false;

  const now = Date.now();
  const start = config.startDate ? new Date(config.startDate).getTime() : null;
  const end = config.endDate ? new Date(config.endDate).getTime() : null;

  if (!start || !end) return false;
  return now >= start && now <= end;
}

function isFrame(categories: ProductCategory[] = [], categorySlugs: string[]) {
  const set = new Set(categorySlugs);
  return categories.some((c) => set.has(c.slug));
}

export function getDisplayPrice(
  product: PriceInput,
  promo: PromoConfig
): DisplayPriceResult {
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

  const promoActive = isPromoActive(promo);
  const frame = isFrame(product.categories, promo.categorySlugs);

  if (regular && promoActive && frame && promo.percent > 0) {
    const final = Number((regular * (1 - promo.percent / 100)).toFixed(2));
    return {
      regular,
      final,
      hasDiscount: true,
      discountPercent: promo.percent,
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
