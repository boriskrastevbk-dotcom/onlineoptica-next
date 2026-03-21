import { wooGet } from "@/lib/woo";

export const dynamic = "force-dynamic";

type WooCategory = {
  id: number;
  name: string;
  slug: string;
  count?: number;
};

export default async function DebugCategories() {
  const cats = await wooGet<WooCategory[]>("/products/categories", {
    per_page: 100,
    hide_empty: false,
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Woo категории (debug)</h1>
      <ul>
        {cats.map((c) => (
          <li key={c.id}>
            <b>{c.name}</b> — <code>{c.slug}</code> {typeof c.count === "number" ? `(count: ${c.count})` : ""}
          </li>
        ))}
      </ul>
    </main>
  );
}
