"use client";

import Link from "next/link";
import CartLink from "@/components/cart/CartLink";
import NavMenu from "@/components/NavMenu";
import { useState } from "react";
import Image from "next/image";
import PromoBar from "@/components/PromoBar";

export default function Header({
  initialLoggedIn = false,
}: {
  initialLoggedIn?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PromoBar />

      <header className="site-header">
        <div className="header-inner">
          <Link
            href="/"
            className="brand"
            onClick={() => setOpen(false)}
            aria-label="Onlineoptica"
          >
            <Image
              src="/logo.svg"
              alt="Onlineoptica"
              width={190}
              height={44}
              priority
              style={{ height: "auto", width: "190px" }}
            />
          </Link>

          <div className="header-nav">
            <NavMenu
              onNavigate={() => setOpen(false)}
              variant="desktop"
              initialLoggedIn={initialLoggedIn}
            />
          </div>

          <form
            action="/search"
            method="get"
            className="header-search"
            onSubmit={() => setOpen(false)}
          >
            <input name="q" placeholder="Търсене…" />
          </form>

          <div className="header-actions">
            <button
              className="icon-btn menu-btn"
              type="button"
              aria-label="Меню"
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <CartLink />
          </div>
        </div>

        {open && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 14px" }}>
              <NavMenu
                onNavigate={() => setOpen(false)}
                variant="mobile"
                initialLoggedIn={initialLoggedIn}
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
