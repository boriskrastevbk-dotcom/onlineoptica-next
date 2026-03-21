"use client";

import { useEffect, useMemo, useState } from "react";

type MeUser = {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  address_1: string;
  postcode: string;
};

type OrderMeta = {
  key: string;
  value: string;
};

type OrderItem = {
  name: string;
  qty: number;
  total: string;
  lenses?: string;
  meta_data?: OrderMeta[];
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
    case "on-hold":
      return "Задържана";
    case "completed":
      return "Изпълнена";
    case "cancelled":
      return "Отказана";
    case "refunded":
      return "Възстановена";
    case "failed":
      return "Неуспешна";
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
    case "on-hold":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "cancelled":
    case "failed":
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

export default function AccountPage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    address_1: "",
    postcode: "",
  });

  useEffect(() => {
  fetch("/api/account/me", {
    cache: "no-store",
    credentials: "include",
  })
    .then((r) => r.json())
    .then((d) => {
      if (d?.ok) {
        setUser(d.user);
        setProfile({
          first_name: d.user.first_name || "",
          last_name: d.user.last_name || "",
          phone: d.user.phone || "",
          city: d.user.city || "",
          address_1: d.user.address_1 || "",
          postcode: d.user.postcode || "",
        });
      }
    })
    .catch(() => {});

  fetch("/api/account/orders?per_page=20&page=1", {
    cache: "no-store",
    credentials: "include",
  })
    .then((r) => r.json())
    .then((d) => {
      if (d?.ok) setOrders(d.orders || []);
    })
    .catch(() => {});
}, []);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setSaveMsg("Не успяхме да запазим промените.");
        return;
      }

      setUser(data.user);
      setProfile({
        first_name: data.user.first_name || "",
        last_name: data.user.last_name || "",
        phone: data.user.phone || "",
        city: data.user.city || "",
        address_1: data.user.address_1 || "",
        postcode: data.user.postcode || "",
      });
      setSaveMsg("Промените са запазени.");
    } catch {
      setSaveMsg("Възникна грешка.");
    } finally {
      setSaving(false);
    }
  }

  const avatarLetter = useMemo(() => {
    if (!user?.name) return "П";
    return user.name.trim().charAt(0).toUpperCase() || "П";
  }, [user]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-lg font-semibold text-white">
              {avatarLetter}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-black">Моят профил</h1>
              <p className="truncate text-sm text-black/60">
                {user?.email || "Зареждане..."}
              </p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="mt-6 space-y-3">
            <input
              className="w-full rounded-xl border p-3"
              placeholder="Име"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Фамилия"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            />

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Телефон"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Град"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Адрес"
              value={profile.address_1}
              onChange={(e) => setProfile({ ...profile, address_1: e.target.value })}
            />

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Пощенски код"
              value={profile.postcode}
              onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
            >
              {saving ? "Записвам..." : "Запази профила"}
            </button>

            {saveMsg ? (
              <div className="rounded-xl border p-3 text-sm">
                {saveMsg}
              </div>
            ) : null}
          </form>
        </aside>

        <section
          id="orders"
          className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-black/45">История</div>
              <h2 className="mt-1 text-2xl font-semibold text-black">Моите поръчки</h2>
            </div>

            <div className="text-sm text-black/50">
              {orders.length ? `${orders.length} поръчки` : "Няма поръчки"}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-[26px] border border-dashed border-black/10 bg-neutral-50 px-8 py-14 text-center">
              <div className="text-xl font-semibold text-black">Все още нямате поръчки</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Когато направите поръчка, тя ще се появи тук.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((o) => {
                const expanded = openOrderId === o.id;

                return (
                  <article
                    key={o.id}
                    className="overflow-hidden rounded-[24px] border border-black/10 bg-white transition hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenOrderId((prev) => (prev === o.id ? null : o.id))}
                      className="flex w-full flex-col gap-4 border-b border-black/10 px-6 py-5 text-left sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-xs uppercase tracking-[0.14em] text-black/45">
                          Поръчка #{o.number}
                        </div>
                        <div className="mt-1 text-sm text-black/60">{formatDate(o.date_created)}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(o.status)}`}>
                          {statusLabel(o.status)}
                        </span>

                        <div className="text-right">
                          <div className="text-xs uppercase tracking-[0.14em] text-black/45">Общо</div>
                          <div className="text-sm font-semibold text-black">
                            {o.total} {o.currency}
                          </div>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="px-6 py-5">
                        <div className="space-y-3">
                          {(o.items || []).map((it, i) => {
                            const meta = it.meta_data || [];
                            const lenses = meta.find((m) => m.key.toLowerCase().includes("стъкл"))?.value;
                            const sphR = meta.find((m) => m.key === "SPH R")?.value;
                            const sphL = meta.find((m) => m.key === "SPH L")?.value;
                            const cylR = meta.find((m) => m.key === "CYL R")?.value;
                            const cylL = meta.find((m) => m.key === "CYL L")?.value;
                            const pd = meta.find((m) => m.key === "PD")?.value;

                            return (
                              <div
                                key={i}
                                className="rounded-xl bg-neutral-50 px-4 py-4"
                              >
                                <div className="text-base font-semibold text-black">
                                  {it.name}
                                </div>

                                {lenses ? (
                                  <div className="mt-2 text-sm text-black/75">
                                    Стъкла: <b>{lenses}</b>
                                  </div>
                                ) : null}

                                {(sphR || sphL || cylR || cylL || pd) && (
                                  <div className="mt-2 text-xs text-black/60 space-y-1">
                                    {sphR && <div>SPH R: {sphR}</div>}
                                    {sphL && <div>SPH L: {sphL}</div>}
                                    {cylR && <div>CYL R: {cylR}</div>}
                                    {cylL && <div>CYL L: {cylL}</div>}
                                    {pd && <div>PD: {pd}</div>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
