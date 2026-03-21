"use client";

import { useCart } from "./CartProvider";
import { useRouter } from "next/navigation";

export default function AddToCartButton(props: {
  productId: number;
  name: string;
  price: number;
  image?: string;
  extras?: {
    lensLabel?: string;
    lensPriceAdd?: number;
    rx?: any;
  };
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleAdd = async () => {
    if (props.disabled) return;

    addItem({
      id: `${props.productId}:${props.extras?.lensLabel || ""}:${props.extras?.lensPriceAdd || 0}`,
      productId: props.productId,
      name: props.name,
      price: props.price,
      image: props.image,
      qty: 1,
      extras: props.extras,
    });

    // лек UX delay (по-плавно усещане)
    setTimeout(() => {
      router.push("/cart");
    }, 120);
  };

  return (
    <button
      disabled={props.disabled}
      onClick={handleAdd}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #d9d9d9",
        background: props.disabled ? "#f3f3f3" : "white",
        fontWeight: 800,
        cursor: props.disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
      }}
    >
      Добавяне в количката
    </button>
  );
}
