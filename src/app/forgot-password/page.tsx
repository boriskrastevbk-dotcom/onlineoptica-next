"use client";

import Link from "next/link";
import { useState } from "react";

function mapError(err: string) {
  switch (err) {
    case "missing_login":
      return "Моля, въведете имейл или потребителско име.";
    case "forgot_password_failed":
      return "Не успяхме да изпратим имейл за възстановяване.";
    case "server_error":
      return "Сървърна грешка.";
    default:
      return err || "Възникна грешка.";
  }
}

export default function ForgotPasswordPage() {
  const [login, setLogin] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setOk(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setErr(mapError(data?.error || "forgot_password_failed"));
        return;
      }

      setOk(true);
    } catch {
      setErr("Сървърна грешка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Забравена парола</h1>

      <p className="mt-3 text-sm text-black/65">
        Въведете имейл или потребителско име. Ако акаунтът съществува, ще получите имейл с инструкции за нова парола.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          className="w-full rounded-xl border p-3"
          placeholder="Имейл или потребител"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
        />

        {err ? (
          <div className="rounded-xl border p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {ok ? (
          <div className="rounded-xl border p-3 text-sm text-emerald-700">
            Ако съществува акаунт с тези данни, изпратихме имейл за възстановяване на паролата.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Изпращам..." : "Изпрати линк"}
        </button>
      </form>

      <div className="mt-4 text-sm">
        <Link href="/login" className="text-black/70 hover:text-black">
          ← Обратно към вход
        </Link>
      </div>
    </main>
  );
}
