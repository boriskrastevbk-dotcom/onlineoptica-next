"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const paymentMethod = searchParams.get("payment_method");

  const isBankTransfer = paymentMethod === "bacs";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 7 9 18l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-[0.14em] text-black/45">
            Поръчката е приета
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-black">
            Благодарим за поръчката!
          </h1>
          <p className="mt-3 text-base leading-7 text-black/65">
            Получихме заявката и ще се свържем с вас при нужда за уточняване на детайлите.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-neutral-50 p-5">
          <div className="text-sm text-black/60">Номер на поръчка</div>
          <div className="mt-1 text-xl font-semibold text-black">
            {orderId ? `#${orderId}` : "Ще го получите в потвърждението"}
          </div>
        </div>

        {isBankTransfer ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-neutral-50 p-5">
            <div className="text-sm font-semibold text-black">Банков превод</div>
            <p className="mt-3 text-sm leading-6 text-black/65">
              Моля, преведете сумата по банковата сметка на магазина.
            </p>

            <div className="mt-4 space-y-2 text-sm text-black">
              <div>
                <b>Получател:</b> Оптика Естетика ЕООД
              </div>
              <div>
                <b>IBAN:</b> BG57BPBI79211046639401
              </div>
              <div>
                <b>BIC:</b> BPBIBGSF
              </div>
              <div>
                <b>Банка:</b> Юробанк България АД
              </div>
              <div>
                <b>Основание:</b> Поръчка {orderId ? `#${orderId}` : ""}
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-black/60">
              Поръчката ще бъде обработена след постъпване на плащането.
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 p-5">
            <div className="text-sm font-semibold text-black">Какво следва</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-black/65">
              <li>Ще прегледаме поръчката и данните за доставка.</li>
              <li>При нужда ще се свържем с вас за уточнение.</li>
              <li>Поръчката ще се обработи и подготви за изпращане.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-black/10 p-5">
            <div className="text-sm font-semibold text-black">Плащане</div>
            <p className="mt-3 text-sm leading-6 text-black/65">
              {isBankTransfer ? (
                <>
                  Избран е <b>банков превод</b>.
                </>
              ) : (
                <>
                  Избран е <b>наложен платеж</b>.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-50"
          >
            Продължи пазаруването
          </Link>

          <Link
            href="/account#orders"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-50"
          >
            Виж моите поръчки
          </Link>
        </div>
      </div>
    </main>
  );
}
