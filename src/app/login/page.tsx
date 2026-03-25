import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getOoToken } from "@/lib/ooSession";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const token = await getOoToken();

  if (token) {
    redirect("/account");
  }

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
