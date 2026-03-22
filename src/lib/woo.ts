import { WOO_CATEGORY_ID_BY_SLUG } from "@/lib/woo-category-map";

const baseUrl = process.env.WOO_BASE_URL!;

export type WooPaged<T> = {
  data: T;
  total: number;
  totalPages: number;
};

type WooCategory = {
  id: number;
  name: string;
  slug: string;
  parent?: number;
};

function appendWooAuth(url: URL) {
  const ck = process.env.WOO_CONSUMER_KEY!;
  const cs = process.env.WOO_CONSUMER_SECRET!;
  url.searchParams.set("consumer_key", ck);
  url.searchParams.set("consumer_secret", cs);
  return url;
}

function parseJson<T>(text: string): T {
  return JSON.parse(text) as T;
}

function normalizeSlug(s: string) {
  let out = s;

  try {
    out = decodeURIComponent(s);
  } catch {}

  return out.trim().toLowerCase();
}

function applySort(url: URL, sort: string) {
  switch (sort) {
    case "new":
      url.searchParams.set("orderby", "date");
      url.searchParams.set("order", "desc");
      break;

    case "old":
      url.searchParams.set("orderby", "date");
      url.searchParams.set("order", "asc");
      break;

    case "price_asc":
      url.searchParams.set("orderby", "price");
      url.searchParams.set("order", "asc");
      break;

    case "price_desc":
      url.searchParams.set("orderby", "price");
      url.searchParams.set("order", "desc");
      break;

    case "name_asc":
      url.searchParams.set("orderby", "title");
      url.searchParams.set("order", "asc");
      break;

    case "name_desc":
      url.searchParams.set("orderby", "title");
      url.searchParams.set("order", "desc");
      break;

    default:
      url.searchParams.set("orderby", "date");
      url.searchParams.set("order", "desc");
      break;
  }
}

async function fetchTextWithTiming(url: string, label: string, revalidate = 300) {
  const started = Date.now();

  const res = await fetch(url, {
    next: { revalidate },
  });

  const text = await res.text();
  const ms = Date.now() - started;

  console.log(`[woo] ${label} ${res.status} in ${ms}ms`);
  console.log(`[woo] URL: ${url}`);

  return { res, text, ms };
}

function resolveCategoryIdBySlugLocal(categorySlug: string): number | null {
  const wanted = normalizeSlug(categorySlug);
  return WOO_CATEGORY_ID_BY_SLUG[wanted] ?? null;
}

export async function ooProductsPaged<T>(
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<WooPaged<T>> {
  const url = appendWooAuth(new URL(`${baseUrl}/wp-json/wc/v3/products`));

  const categorySlugRaw =
    typeof params.category_slug === "string" ? params.category_slug : undefined;

  const sort = typeof params.sort === "string" ? params.sort : "new";

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (k === "category_slug") continue;
    if (k === "sort") continue;

    url.searchParams.set(k, String(v));
  }

  if (!url.searchParams.has("stock_status")) {
    url.searchParams.set("stock_status", "instock");
  }

  applySort(url, sort);

  if (categorySlugRaw) {
    const categoryId = resolveCategoryIdBySlugLocal(categorySlugRaw);

    if (!categoryId) {
      console.log(`[woo] category not found in local map for slug: ${categorySlugRaw}`);
      return {
        data: [] as T,
        total: 0,
        totalPages: 0,
      };
    }

    url.searchParams.set("category", String(categoryId));
  }

  const { res, text } = await fetchTextWithTiming(
    url.toString(),
    `products sort=${sort}${categorySlugRaw ? ` category_slug=${categorySlugRaw}` : ""}`
  );

  if (!res.ok) {
    throw new Error(`Woo GET /products failed: ${res.status} ${res.statusText} ${text}`);
  }

  const total = Number(res.headers.get("x-wp-total") || "0");
  const totalPages = Number(res.headers.get("x-wp-totalpages") || "0");
  const data = parseJson<T>(text);

  return {
    data,
    total: total || (Array.isArray(data) ? data.length : 0),
    totalPages: totalPages || 1,
  };
}

export async function wooGetProductById<T>(id: number): Promise<T> {
  const url = appendWooAuth(new URL(`${baseUrl}/wp-json/wc/v3/products/${id}`));

  const { res, text } = await fetchTextWithTiming(url.toString(), `product id=${id}`);

  if (!res.ok) {
    throw new Error(
      `Woo GET /products/${id} failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  return parseJson<T>(text);
}

export async function wooGetProducts<T>(
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const url = appendWooAuth(new URL(`${baseUrl}/wp-json/wc/v3/products`));

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  if (!url.searchParams.has("stock_status")) {
    url.searchParams.set("stock_status", "instock");
  }

  const { res, text } = await fetchTextWithTiming(url.toString(), "products raw");

  if (!res.ok) {
    throw new Error(`Woo GET /products failed: ${res.status} ${res.statusText} ${text}`);
  }

  return parseJson<T>(text);
}

export async function wooGetCategories<T>(
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const url = appendWooAuth(new URL(`${baseUrl}/wp-json/wc/v3/products/categories`));

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  const { res, text } = await fetchTextWithTiming(url.toString(), "categories raw");

  if (!res.ok) {
    throw new Error(
      `Woo GET /products/categories failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  return parseJson<T>(text);
}
