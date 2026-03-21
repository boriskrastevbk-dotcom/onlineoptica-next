"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Promo = {
  enabled: boolean;
  percent: number;
  end: string;
  active: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_WP_URL
  ? `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/onlineoptica/v1/promo`
  : "/wp-json/onlineoptica/v1/promo";

export default function PromoBar() {
  const [promo, setPromo] = useState<Promo | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then(setPromo)
      .catch(() => {});
  }, []);

  if (!promo || !promo.active) return null;

  const endDate = promo.end
    ? new Date(promo.end).toLocaleDateString("bg-BG")
    : "";

  return (
    <div
      className="promo-bar"
      onClick={() => router.push("/c/диоптрични-рамки")}
      style={{ cursor: "pointer" }}
    >
      <strong>−{promo.percent}%</strong> на диоптрични рамки
      {endDate ? ` до ${endDate}` : ""}
    </div>
  );
}
