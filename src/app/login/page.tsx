import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
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
      <LoginClient />
    </Suspense>
  );
}
