"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatDual } from "@/lib/price";

type RxState = {
  sphR?: string;
  sphL?: string;
  cylR?: string;
  cylL?: string;
  axisR?: string;
  axisL?: string;
  pd?: string;
};

function hasRealRxValue(v?: string) {
  if (!v) return false;
  const normalized = v.trim().toUpperCase();
  return normalized !== "НЯМА" && normalized !== "БЕЗ ДИОПТЪР";
}

function compactRx(rx: RxState) {
  const parts: string[] = [];

  if (rx.sphR) parts.push(`R ${rx.sphR}`);
  if (rx.sphL) parts.push(`L ${rx.sphL}`);
  if (rx.pd) parts.push(`PD ${rx.pd}`);

  return parts.join(" / ");
}

function rxLine(label: string, v?: string) {
  if (!v) return null;
  return (
    <span>
      <b>{label}</b> {v}
    </span>
  );
}

export default function CartPage() {
  const cart = useCart();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canCheckout = acceptedTerms && acceptedPrivacy;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Количка</h1>
          <p className="mt-1 text-sm text-black/60">
            Прегледайте избраните рамки и стъкла преди да продължите.
          </p>
        </div>

      </header>

      {cart.items.length === 0 ? (
        <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="text-xl font-semibold text-black">Количката е празна</div>
          <p className="mt-3 text-sm text-black/60">
            Добавете продукт, за да продължите към поръчка.
          </p>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-50"
            >
              Към магазина
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            {cart.items.map((it) => {
              const rx = (it.extras?.rx || {}) as RxState;
              const showDetailedRx =
                hasRealRxValue(rx.sphR) ||
                hasRealRxValue(rx.sphL) ||
                hasRealRxValue(rx.cylR) ||
                hasRealRxValue(rx.cylL) ||
                !!rx.axisR ||
                !!rx.axisL ||
                !!rx.pd;

              return (
                <article
                  key={it.id}
                  className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:p-5"
                >
                  <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
                    <div className="flex items-start sm:block">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{
                            width: 96,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 14,
                            background: "#f4f4f4",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 96,
                            height: 72,
                            background: "#f4f4f4",
                            borderRadius: 14,
                          }}
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-xl font-semibold leading-tight text-black">
                            {it.name}
                          </h2>

                          {it.extras?.lensLabel ? (
                            <div className="mt-2 text-sm font-medium text-black/70">
                              + {it.extras.lensLabel}
                            </div>
                          ) : null}

                          {it.extras?.rx ? (
                            <div className="mt-2 text-sm text-black/60">
                              RX: {compactRx(rx)}
                            </div>
                          ) : null}

                          {it.extras?.lensLabel ? (
                            <div className="mt-3 text-sm text-black/75">
                              Стъкла: <b>{it.extras.lensLabel}</b>
                            </div>
                          ) : null}

                          {showDetailedRx ? (
                            <div className="mt-3 space-y-1 text-sm text-black/60">
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {rxLine("SPH R:", rx.sphR)}
                                {rxLine("SPH L:", rx.sphL)}
                                {rxLine("CYL R:", rx.cylR)}
                                {rxLine("CYL L:", rx.cylL)}
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {rx.axisR ? (
                                  <span>
                                    <b>Axis R:</b> {rx.axisR}
                                  </span>
                                ) : null}
                                {rx.axisL ? (
                                  <span>
                                    <b>Axis L:</b> {rx.axisL}
                                  </span>
                                ) : null}
                                {rx.pd ? (
                                  <span>
                                    <b>PD:</b> {rx.pd}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ) : null}

                          <div className="mt-4 text-base font-semibold text-black">
                            Цена: {formatDual(it.price)}
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-4 rounded-2xl bg-neutral-50 px-4 py-3 lg:min-w-[160px] lg:flex-col lg:items-end lg:bg-transparent lg:px-0 lg:py-0">
                          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-3 py-2">
                            <button
                              type="button"
                              onClick={() => cart.setQty(it.id, it.qty - 1)}
                              className="text-lg font-semibold text-black/75 hover:text-black"
                              aria-label="Намали количеството"
                            >
                              −
                            </button>

                            <span className="min-w-[18px] text-center text-sm font-semibold text-black">
                              {it.qty}
                            </span>

                            <button
                              type="button"
                              onClick={() => cart.setQty(it.id, it.qty + 1)}
                              className="text-lg font-semibold text-black/75 hover:text-black"
                              aria-label="Увеличи количеството"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => cart.removeItem(it.id)}
                            className="text-sm font-medium text-black/60 transition hover:text-rose-700"
                          >
                            Премахни
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="h-fit rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] lg:sticky lg:top-6">
            <div className="border-b border-black/10 pb-4">
              <div className="text-xs uppercase tracking-[0.14em] text-black/45">
                Резюме
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-black">Общо</h2>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-black/60">Артикули</span>
              <span className="font-medium text-black">{cart.items.length}</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-black/60">Междинна сума</span>
              <span className="font-medium text-black">
                {formatDual(cart.subtotal)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-black/60">Доставка</span>
              <span className="text-black/60">Уточнява се</span>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-black">Общо</span>
                <span className="text-lg font-semibold text-black">
                  {formatDual(cart.total)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-black/10 bg-neutral-50 p-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-black/75">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Съгласен съм с{" "}
                  <Link
		    href="/usloviya-za-pazaruvane"                   
                    target="_blank"
                    className="font-medium text-black underline underline-offset-2"
                  >
                    Условията за пазаруване
                  </Link>
                  .
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-black/75">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Съгласен съм с{" "}
                  <Link
		    href="/poveritelnost"                    
                    target="_blank"
                    className="font-medium text-black underline underline-offset-2"
                  >
                    Поверителност и защита на данните
                  </Link>
                  .
                </span>
              </label>

              {!canCheckout && (
                <div className="text-xs text-rose-700">
                  За да продължите към поръчка, трябва да приемете условията и
                  политиката за поверителност.
                </div>
              )}
            </div>

            <div className="mt-5">
              {canCheckout ? (
                <Link
                  href="/checkout"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 22px",
                    borderRadius: 16,
                    background: "linear-gradient(180deg,#1c1c1c 0%,#0f0f0f 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    textDecoration: "none",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.16)",
                    transition: "transform .15s ease, box-shadow .15s ease, filter .15s ease",
                    transform: "translateY(0)",
                    filter: "brightness(1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 18px 34px rgba(0,0,0,0.22)";
                    e.currentTarget.style.filter = "brightness(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 14px 30px rgba(0,0,0,0.16)";
                    e.currentTarget.style.filter = "brightness(1)";
                  }}
                >
                  Към поръчка →
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 22px",
                    borderRadius: 16,
                    background: "linear-gradient(180deg,#4a4a4a 0%,#2f2f2f 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    textDecoration: "none",
                    boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
                    opacity: 0.6,
                    cursor: "not-allowed",
                  }}
                >
                  Към поръчка →
                </button>
              )}
            </div>

            <div className="mt-3">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-50"
              >
                Продължи пазаруването
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
