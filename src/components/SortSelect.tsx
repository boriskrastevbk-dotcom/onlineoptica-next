"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({
  value,
  baseUrl,
}: {
  value: string;
  baseUrl: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={value}
      onChange={(e) => {
        const nextSort = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        params.set("sort", nextSort);
        params.set("page", "1");

        router.push(`${baseUrl}?${params.toString()}`);
        // router.refresh(); // Можете да коментирате или премахнете това
      }}
      style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #d9d9d9" }}
    >
      <option value="new">Най-нови</option>
      <option value="price_asc">Цена: ниска → висока</option>
      <option value="price_desc">Цена: висока → ниска</option>
      <option value="name_asc">Име: A → Я</option>
      <option value="name_desc">Име: Я → A</option>
      <option value="old">Най-стари</option>
    </select>
  );
}
