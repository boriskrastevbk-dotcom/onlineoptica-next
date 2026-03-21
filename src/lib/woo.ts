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

const categoryIdCache = new Map<string, number | null>();

function wooAuthHeader() {
  const ck = process.env.WOO_CONSUMER_KEY!;
  const cs = process.env.WOO_CONSUMER_SECRET!;
  const token = Buffer.from(`${ck}:${cs}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

function parseJson<T>(text: string): T {
  return JSON.parse(text) as T;
}

function normalizeSlug(s: string) {
  let out = s;

  try {
    out = decodeURIComponent(s);
  } catch {}

  return out
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");
}

async function resolveCategoryIdBySlug(categorySlug: string): Promise<number | null> {
  const wanted = normalizeSlug(categorySlug);

  if (categoryIdCache.has(wanted)) {
    return categoryIdCache.get(wanted) ?? null;
  }

  const url = new URL(`${baseUrl}/wp-json/wc/v3/products/categories`);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("hide_empty", "false");

  const res = await fetch(url.toString(), {
    headers: { ...wooAuthHeader() },
    next: { revalidate: 300 },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `Woo GET /products/categories failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  const categories = parseJson<WooCategory[]>(text);

  const found =
    categories.find((c) => normalizeSlug(c.slug) === wanted) ||
    categories.find((c) => normalizeSlug(c.name) === wanted);

  const id = found?.id ?? null;
  categoryIdCache.set(wanted, id);

  return id;
}

export async function ooProductsPaged<T>(
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<WooPaged<T>> {
  const url = new URL(`${baseUrl}/wp-json/wc/v3/products`);

  const categorySlugRaw =
    typeof params.category_slug === "string" ? params.category_slug : undefined;

  const sort = typeof params.sort === "string" ? params.sort : "new";

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (k === "category_slug") continue;
    if (k === "sort") continue;

    url.searchParams.set(k, String(v));
  }

  // По подразбиране показваме само налични продукти,
  // освен ако изрично не е подаден stock_status
  if (!url.searchParams.has("stock_status")) {
    url.searchParams.set("stock_status", "instock");
  }

  url.searchParams.set("oo_sort", sort);

  if (categorySlugRaw) {
    const categoryId = await resolveCategoryIdBySlug(categorySlugRaw);

    if (!categoryId) {
      return {
        data: [] as T,
        total: 0,
        totalPages: 0,
      };
    }

    url.searchParams.set("category", String(categoryId));
  }

  const res = await fetch(url.toString(), {
    headers: { ...wooAuthHeader() },
    next: { revalidate: 300 },
  });

  const text = await res.text();

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
  const url = new URL(`${baseUrl}/wp-json/wc/v3/products/${id}`);

  const res = await fetch(url.toString(), {
    headers: { ...wooAuthHeader() },
    next: { revalidate: 300 },
  });

  const text = await res.text();

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
  const url = new URL(`${baseUrl}/wp-json/wc/v3/products`);

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  // По подразбиране показваме само налични продукти,
  // освен ако изрично не е подаден stock_status
  if (!url.searchParams.has("stock_status")) {
    url.searchParams.set("stock_status", "instock");
  }

  const res = await fetch(url.toString(), {
    headers: { ...wooAuthHeader() },
    next: { revalidate: 300 },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Woo GET /products failed: ${res.status} ${res.statusText} ${text}`);
  }

  return parseJson<T>(text);
}

export async function wooGetCategories<T>(
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const url = new URL(`${baseUrl}/wp-json/wc/v3/products/categories`);

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: { ...wooAuthHeader() },
    next: { revalidate: 300 },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `Woo GET /products/categories failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  return parseJson<T>(text);
}
