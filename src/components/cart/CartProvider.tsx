"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string; // unique key (може productId + extras)
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
  extras?: {
    lensLabel?: string;
    lensPriceAdd?: number;
    rx?: any;
  };
};

type CartCtx = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;

  subtotal: number;
  total: number; // alias за съвместимост със src/app/cart/page.tsx
};

const CartContext = createContext<CartCtx | null>(null);

const STORAGE_KEY = "oo_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + (item.qty || 1) };
        return next;
      }
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const setQty = (id: string, qty: number) => {
    const q = Math.max(1, Math.floor(qty || 1));
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: q } : p)));
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 1), 0),
    [items]
  );

  const value: CartCtx = {
    items,
    addItem,
    removeItem,
    setQty,
    clear,
    subtotal,
    total: subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart() must be used inside <CartProvider>.");
  return ctx;
}
