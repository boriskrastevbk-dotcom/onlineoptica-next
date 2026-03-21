"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export default function CartLink() {
  const cart = useCart();
  const count = cart.items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const shownCount = count > 99 ? "99+" : String(count);

  return (
    <Link
      href="/cart"
      className="cart-btn"
      aria-label={count > 0 ? `Количка, ${count} бр.` : "Количка"}
      title={count > 0 ? `Количка (${count})` : "Количка"}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.5 6h14l-1.2 7.2a2 2 0 0 1-2 1.7H9.2a2 2 0 0 1-2-1.6L5.3 3.8A1 1 0 0 0 4.3 3H2.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          fill="currentColor"
        />
      </svg>

      {count > 0 && (
        <span className="cart-badge" aria-hidden="true">
          {shownCount}
        </span>
      )}
    </Link>
  );
}
