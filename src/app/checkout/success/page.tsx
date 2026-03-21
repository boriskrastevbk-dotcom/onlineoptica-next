import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="text-sm text-black/60">Зареждане...</div>
          </div>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
