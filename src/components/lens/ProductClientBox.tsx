"use client";

import AddToCartButton from "@/components/cart/AddToCartButton";
import LensConfigurator from "@/components/lens/LensConfigurator";
import { LENS_OPTIONS } from "@/lib/lensOptions";

export default function ProductClientBox(props: {
  productId: number;
  name: string;
  price: number;
  image?: string;
  slug: string;
}) {
  const slug = safeDecodeTwice(props.slug).toLowerCase();
  const name = (props.name || "").toLowerCase();

  // --- Heuristics (докато не добавим категории от API) ---
  // 1) Ако е слънчев продукт -> НЕ изискваме стъкла
  const isSunglasses =
    slug.includes("слънч") ||
    name.includes("слънч") ||
    slug.includes("sunglass") ||
    slug.includes("sunglasses") ||
    name.includes("sunglass") ||
    name.includes("sunglasses");

  // 2) Ако е рамка (но НЕ слънчева) -> изискваме стъкла
  //    (в твоя каталог рамките са диоптрични по дефиниция; ако имаш и други рамки, кажи)
  const looksLikeFrame =
    slug.includes("рамка") || name.includes("рамка");

  // 3) Допълнителен сигнал "диоптр"
  const hasDioptr =
    slug.includes("диоптр") || name.includes("диоптр");

  // Final decision
  const requireLens = !isSunglasses && (looksLikeFrame || hasDioptr);

  if (requireLens) {
    return (
      <LensConfigurator
        productId={props.productId}
        name={props.name}
        basePrice={Number.isFinite(props.price) ? props.price : 0}
        image={props.image}
        requireLens={true}
        options={LENS_OPTIONS}
      />
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      <AddToCartButton
        productId={props.productId}
        name={props.name}
        price={Number.isFinite(props.price) ? props.price : 0}
        image={props.image}
      />
    </div>
  );
}

function safeDecodeTwice(s: string) {
  let out = s || "";
  try {
    out = decodeURIComponent(out);
  } catch {}
  try {
    out = decodeURIComponent(out);
  } catch {}
  return out;
}
