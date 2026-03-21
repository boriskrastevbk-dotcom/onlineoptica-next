"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function mapError(err: string) {
  switch (err) {
    case "missing_fields":
      return "Липсват нужните данни за смяна на паролата.";
    case "weak_password":
      return "Паролата трябва да е поне 8 символа.";
    case "invalid_or_expired_key":
      return "Линкът е невалиден или е изтекъл.";
    case "server_error":
      return "Сървърна грешка.";
    default:
      return err || "Възникна грешка.";
  }
}

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();

  const login = useMemo(() => searchParams.get("login") || "", [searchParams]);
  const key = useMemo(() => searchParams.get("key") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setOk(false);

    if (!login || !key) {
      setErr("Липсва валиден reset линк.");
      return;
    }

    if (password !== password2) {
      setErr("Паролите не съвпадат.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login,
          key,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setErr(mapError(data?.error || "server_error"));
        return;
      }

      setOk(true);
      setPassword("");
      setPassword2("");
    } catch {
      setErr("Сървърна грешка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Нова парола</h1>

      <p className="mt-3 text-sm text-black/65">
        Въведете нова парола за профила си.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          className="w-full rounded-xl border p-3"
          type="password"
          placeholder="Нова парола"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <input
          className="w-full rounded-xl border p-3"
          type="password"
          placeholder="Повторете новата парола"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          autoComplete="new-password"
        />

        {err ? (
          <div className="rounded-xl border p-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {ok ? (
          <div className="rounded-xl border p-3 text-sm text-emerald-700">
            Паролата беше променена успешно.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Записвам..." : "Запази новата парола"}
        </button>
      </form>

      <div className="mt-4 text-sm">
        <Link href="/login" className="text-black/70 hover:text-black">
          ← Към вход
        </Link>
      </div>
    </main>
  );
}
