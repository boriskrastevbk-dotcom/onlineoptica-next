import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import Header from "@/components/Header";
import { getOoToken } from "@/lib/ooSession";

export const metadata: Metadata = {
  title: "Onlineoptica",
  description: "Onlineoptica – онлайн магазин за очила и рамки",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getOoToken();
  const initialLoggedIn = !!token;

  return (
    <html lang="bg">
      <body>
        <CartProvider>
          <Header initialLoggedIn={initialLoggedIn} />

          <main>{children}</main>

          <footer className="site-footer">
            <div className="footer-inner">
              <div className="footer-left">
                © {new Date().getFullYear()} Onlineoptica
              </div>

              <nav className="footer-links" aria-label="Footer">
                <a href="/usloviya-za-pazaruvane">Условия за пазаруване</a>
                <a href="/poveritelnost">Поверителност и защита на данните</a>
              </nav>
            </div>
          </footer>
        </CartProvider>

        <Analytics />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
