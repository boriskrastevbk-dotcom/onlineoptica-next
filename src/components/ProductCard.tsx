import Image from "next/image";
import Link from "next/link";
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
  price: string;
  regular_price: string;
  sale_price?: string;
  on_sale: boolean;
  categories?: WooCategory[];
  images?: { src: string; alt?: string }[];
};

export default async function ProductCard({ p }: { p: WooProduct }) {
  const promo = await getPromoDisplayPrice(p);

  return (
    <Link href={`/p/${p.id}`} className="card">
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

        {promo.hasDiscount && promo.regular !== null && (
          <span className="pprice-strike">
            {formatDual(String(promo.regular))}
          </span>
        )}

        <span className="pprice">
          {promo.final !== null ? formatDual(String(promo.final)) : ""}
        </span>

        {promo.hasDiscount && promo.discountPercent && (
          <span className="promo-badge">-{promo.discountPercent}%</span>
        )}
      </div>

      <div className="pname">{p.name}</div>
    </Link>
  );
}
