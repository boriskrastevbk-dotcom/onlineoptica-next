"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDual } from "@/lib/price";

type MeUser = {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  address_1?: string;
  postcode?: string;
};

type CustomerForm = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
  address_1: string;
  postcode: string;
  notes: string;
};

type DeliveryMethod = "speedy_office" | "address";
type PaymentMethod = "cod" | "bacs";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [msg, setMsg] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("speedy_office");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");
  const [speedyOffice, setSpeedyOffice] = useState("");

  const [customer, setCustomer] = useState<CustomerForm>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    city: "",
    address_1: "",
    postcode: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/account/me", {
      cache: "no-store",
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.ok || !d?.user) return;

        const u = d.user as MeUser;

        setCustomer((prev) => ({
          ...prev,
          first_name: u.first_name || u.name?.split(" ")[0] || "",
          last_name: u.last_name || "",
          phone: u.phone || "",
          email: u.email || "",
          city: u.city || "",
          address_1: u.address_1 || "",
          postcode: u.postcode || "",
        }));
      })
      .catch(() => {})
      .finally(() => {
        setLoadingProfile(false);
      });
  }, []);

  const itemCount = useMemo(
    () => cart.items.reduce((sum, x) => sum + x.qty, 0),
    [cart.items]
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cart.items.length === 0) return;

    if (deliveryMethod === "speedy_office" && !speedyOffice.trim()) {
      setMsg("Моля, въведете офис на Спиди.");
      return;
    }

    if (deliveryMethod === "address" && !customer.address_1.trim()) {
      setMsg("Моля, въведете адрес за доставка.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          customer,
          delivery: {
            method: deliveryMethod,
            office: speedyOffice,
          },
          payment: {
            method: paymentMethod,
          },
          items: cart.items.map((x) => ({
            productId: x.productId,
            qty: x.qty,
            name: x.name,
            price: x.price,
            extras: x.extras,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.details || json?.error || "Checkout failed");
      }


cart.clear();
router.push(
  `/checkout/success?order_id=${encodeURIComponent(String(json.order_id))}&payment_method=${encodeURIComponent(String(json.payment_method || ""))}`
);
router.refresh();

    } catch (err: any) {
      setMsg(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof CustomerForm>(
    key: K,
    value: CustomerForm[K]
  ) {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Поръчка</h1>
          <p className="mt-1 text-sm text-black/60">
            Попълнете данните за доставка и потвърдете поръчката.
          </p>
        </div>

      </div>

      {cart.items.length === 0 ? (
        <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <p className="text-black/70">Количката е празна.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="border-b border-black/10 pb-4">
              <div className="text-xs uppercase tracking-[0.14em] text-black/45">
                Доставка и плащане
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-black">
                Данни за поръчката
              </h2>
            </div>

            {loadingProfile ? (
              <div className="mt-5 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-black/60">
                Зареждаме данните от профила...
              </div>
            ) : null}

            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                <div className="text-sm font-semibold text-black">
                  Метод на доставка
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-white p-3">
                    <input
                      type="radio"
                      name="delivery_method"
                      value="speedy_office"
                      checked={deliveryMethod === "speedy_office"}
                      onChange={() => setDeliveryMethod("speedy_office")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-black">
                        Безплатна доставка до офис на Спиди
                      </div>
                      <div className="mt-1 text-sm text-black/60">
                        Получаване от избран офис на Спиди.
                      </div>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-white p-3">
                    <input
                      type="radio"
                      name="delivery_method"
                      value="address"
                      checked={deliveryMethod === "address"}
                      onChange={() => setDeliveryMethod("address")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-black">
                        Доставка до адрес
                      </div>
                      <div className="mt-1 text-sm text-black/60">
                        Доставката до адрес се уточнява допълнително.
                      </div>
                    </div>
                  </label>
                </div>

                {deliveryMethod === "speedy_office" ? (
                  <div className="mt-4">
                    <input
                      className="w-full rounded-xl border border-black/10 bg-white p-3"
                      placeholder="Офис на Спиди (напр. Русе Център)"
                      value={speedyOffice}
                      onChange={(e) => setSpeedyOffice(e.target.value)}
                      required
                    />
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                <div className="text-sm font-semibold text-black">
                  Метод на плащане
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-white p-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-black">
                        Наложен платеж
                      </div>
                      <div className="mt-1 text-sm text-black/60">
                        Плащане при получаване на пратката.
                      </div>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-white p-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bacs"
                      checked={paymentMethod === "bacs"}
                      onChange={() => setPaymentMethod("bacs")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-black">
                        Банков превод
                      </div>
                      <div className="mt-1 text-sm text-black/60">
                        След поръчка ще получите данни за банков превод.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-black/10 bg-white p-3"
                  placeholder="Име"
                  value={customer.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  required
                />

                <input
                  className="w-full rounded-xl border border-black/10 bg-white p-3"
                  placeholder="Фамилия"
                  value={customer.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-black/10 bg-white p-3"
                  placeholder="Телефон"
                  value={customer.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />

                <input
                  className="w-full rounded-xl border border-black/10 bg-white p-3"
                  placeholder="Имейл"
                  value={customer.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                <input
                  className="w-full rounded-xl border border-black/10 bg-white p-3"
                  placeholder="Град"
                  value={customer.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                />

                <input
                  className="w-full rounded-xl border border-black/10 bg-white p-3"
                  placeholder="Пощенски код"
                  value={customer.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                />
              </div>

              {deliveryMethod === "address" ? (
                <input
                  className="w-full rounded-xl border border-black/10 bg-white p-3"
                  placeholder="Адрес"
                  value={customer.address_1}
                  onChange={(e) => updateField("address_1", e.target.value)}
                  required
                />
              ) : null}

              <textarea
                className="w-full rounded-xl border border-black/10 bg-white p-3"
                placeholder="Бележка към поръчката (по желание)"
                rows={4}
                value={customer.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Изпращам..." : "Потвърди поръчката"}
              </button>

              {msg ? (
                <div className="rounded-2xl border border-black/10 p-4 text-sm font-medium">
                  {msg}
                </div>
              ) : null}
            </form>
          </section>

          <aside className="h-fit rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] lg:sticky lg:top-6">
            <div className="border-b border-black/10 pb-4">
              <div className="text-xs uppercase tracking-[0.14em] text-black/45">
                Резюме
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-black">
                Вашата поръчка
              </h2>
              <div className="mt-2 text-sm text-black/60">
                {itemCount} {itemCount === 1 ? "артикул" : "артикула"}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {cart.items.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl bg-neutral-50 px-4 py-4"
                >
                  <div className="text-sm font-semibold text-black">
                    {it.name}
                  </div>

                  {it.extras?.lensLabel ? (
                    <div className="mt-1 text-sm text-black/65">
                      Стъкла: {it.extras.lensLabel}
                    </div>
                  ) : null}

                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-black/60">Брой</span>
                    <span className="font-medium text-black">{it.qty}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-black/60">Цена</span>
                    <span className="font-semibold text-black">
                      {formatDual(it.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Междинна сума</span>
                <span className="font-medium text-black">
                  {formatDual(cart.subtotal)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-black/60">Доставка</span>
                <span className="text-black/60">
                  {deliveryMethod === "speedy_office"
                    ? "Безплатно до офис на Спиди"
                    : "До адрес"}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-black/60">Плащане</span>
                <span className="text-black/60">
                  {paymentMethod === "cod" ? "Наложен платеж" : "Банков превод"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
                <span className="text-base font-semibold text-black">Общо</span>
                <span className="text-xl font-semibold text-black">
                  {formatDual(cart.total)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
