"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type OrderItem = {
  name: string;
  qty: number;
  total: string;
};

type Order = {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  date_created: string | null;
  items: OrderItem[];
};

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Очаква плащане";
    case "processing":
      return "Подготвя се";
    case "completed":
      return "Изпълнена";
    case "cancelled":
      return "Отказана";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "processing":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
  }
}

function formatDate(value: string | null) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("bg-BG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/account/orders?id=${orderId}`, {
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.ok) {
          router.push("/account");
          return;
        }

        setOrder(data.order);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [orderId, router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="text-sm text-black/60">Зареждане...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        Поръчката не е намерена.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/account"
          className="text-sm text-black/60 hover:text-black"
        >
          ← Обратно към профила
        </Link>
      </div>

      <div className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">

        <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-black/45">
              Поръчка #{order.number}
            </div>

            <div className="mt-1 text-sm text-black/60">
              {formatDate(order.date_created)}
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
              order.status
            )}`}
          >
            {statusLabel(order.status)}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start justify-between rounded-xl bg-neutral-50 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium text-black">
                  {item.name}
                </div>

                <div className="text-xs text-black/55">
                  Количество: {item.qty}
                </div>
              </div>

              <div className="text-sm font-medium text-black">
                {item.total} {order.currency}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-black/10 pt-6 flex justify-between">

          <div className="text-sm text-black/60">
            Обща сума
          </div>

          <div className="text-lg font-semibold text-black">
            {order.total} {order.currency}
          </div>

        </div>
      </div>
    </main>
  );
}
