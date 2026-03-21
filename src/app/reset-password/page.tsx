import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md p-6">
          <div className="rounded-xl border p-3 text-sm text-black/60">
            Зареждане...
          </div>
        </main>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
