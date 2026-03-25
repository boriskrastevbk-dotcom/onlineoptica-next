"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type User = {
  name?: string;
  email?: string;
};

const STORAGE_KEY = "oo_header_user";

export default function HeaderAccount({
  initialLoggedIn = false,
}: {
  initialLoggedIn?: boolean;
}) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  function loadCachedUser() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as User;
      return parsed || null;
    } catch {
      return null;
    }
  }

  async function refreshUser() {
    const cached = loadCachedUser();

    if (cached) {
      setUser(cached);
      setLoggedIn(true);
    }

    try {
      const r = await fetch("/api/account/me", {
        cache: "no-store",
        credentials: "include",
      });

      const d = await r.json().catch(() => ({}));

      if (d?.ok && d?.user) {
        setUser(d.user);
        setLoggedIn(true);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d.user));
        } catch {}
      } else {
        if (!initialLoggedIn && !cached) {
          setUser(null);
          setLoggedIn(false);
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {}
        }
      }
    } catch {
      if (!initialLoggedIn && !cached) {
        setUser(null);
        setLoggedIn(false);
      }
    } finally {
      setChecked(true);
    }
  }

  useEffect(() => {
    const cached = loadCachedUser();
    if (cached) {
      setUser(cached);
      setLoggedIn(true);
    }
    refreshUser();
  }, []);

  useEffect(() => {
    refreshUser();
  }, [pathname]);

  useEffect(() => {
    function onAuthChanged() {
      refreshUser();
    }

    window.addEventListener("oo-auth-changed", onAuthChanged);
    return () => {
      window.removeEventListener("oo-auth-changed", onAuthChanged);
    };
  }, []);

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
    if (user?.name) {
      const first = user.name.trim().split(" ")[0];
      return first.length > 16 ? first.slice(0, 16) + "…" : first;
    }
    return "Профил";
  }, [user]);

  if (!checked && !loggedIn) {
    return <span className="nav-link opacity-60">...</span>;
  }

  if (!loggedIn) {
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
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15 text-blue-500">
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
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="account-dropdown absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border bg-white shadow-lg">
          <div className="border-b px-4 py-3">
            <div className="text-sm font-medium">{user?.name || "Моят профил"}</div>
            {user?.email && (
              <div className="text-xs opacity-60">{user.email}</div>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/account"
              className="block px-4 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Моят профил
            </Link>

            <Link
              href="/account#orders"
              className="block px-4 py-2 hover:bg-gray-100"
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
                window.dispatchEvent(new Event("oo-auth-changed"));
              }}
            >
              <button className="w-full text-left px-4 py-2 hover:bg-red-50">
                Изход
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
