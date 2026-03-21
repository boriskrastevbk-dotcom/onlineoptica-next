"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type User = {
  name: string;
  email?: string;
};

const STORAGE_KEY = "oo_header_user";

export default function HeaderAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // 1) зареждаме cached user веднага, за да няма фалшиво "Вход"
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        if (parsed?.name) {
          setUser(parsed);
        }
      }
    } catch {}
  }, []);

  // 2) проверяваме реалната сесия
  useEffect(() => {
    fetch("/api/account/me", {
      cache: "no-store",
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d?.user) {
          setUser(d.user);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d.user));
          } catch {}
        } else {
          setUser(null);
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        setChecked(true);
      });
  }, []);

  // 3) затваряне на dropdown
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user?.name) return "";
    const first = user.name.trim().split(" ")[0];
    return first.length > 16 ? first.slice(0, 16) + "…" : first;
  }, [user]);

  if (!checked && !user) {
    return <span className="nav-link opacity-60">...</span>;
  }

  if (!user) {
    return (
      <Link href="/login" className="nav-link">
        Вход
      </Link>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        className="nav-link inline-flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-500"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
              fill="currentColor"
            />
          </svg>
        </span>

        <span>{displayName}</span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className={`transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="account-dropdown absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.14)]">
          <div className="border-b border-black/10 px-4 py-3">
            <div className="text-sm font-medium text-black">{user.name}</div>
            {user.email ? (
              <div className="mt-0.5 truncate text-xs text-black/55">{user.email}</div>
            ) : null}
          </div>

          <div className="py-1.5">
            <Link
              href="/account"
              className="block px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 hover:text-black"
              onClick={() => setOpen(false)}
            >
              Моят профил
            </Link>

            <Link
              href="/account#orders"
              className="block px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 hover:text-black"
              onClick={() => setOpen(false)}
            >
              Моите поръчки
            </Link>

            <form
              action="/api/auth/logout"
              method="post"
              onSubmit={() => {
                try {
                  sessionStorage.removeItem(STORAGE_KEY);
                } catch {}
              }}
            >
              <button
                type="submit"
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-neutral-900 transition-colors hover:bg-rose-50 hover:text-rose-700"
              >
                Изход
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
