type ProductPriceProps = {
  regular: number | null;
  final: number | null;
  hasDiscount: boolean;
  discountPercent: number | null;
};

function formatPrice(value: number | null) {
  if (value === null) return "";
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "BGN",
  }).format(value);
}

export default function ProductPrice({
  regular,
  final,
  hasDiscount,
  discountPercent,
}: ProductPriceProps) {
  if (!hasDiscount) {
    return (
      <div className="text-base font-semibold text-neutral-900">
        {formatPrice(final)}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-lg font-semibold text-red-600">
        {formatPrice(final)}
      </span>

      <span className="text-sm text-neutral-400 line-through">
        {formatPrice(regular)}
      </span>

      {discountPercent ? (
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
          -{discountPercent}%
        </span>
      ) : null}
    </div>
  );
}
