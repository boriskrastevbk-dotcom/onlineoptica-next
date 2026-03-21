import Link from "next/link";
import HeaderAccount from "@/components/HeaderAccount";

export default function NavMenu({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const isMobile = variant === "mobile";

  return (
    <nav
      style={
        isMobile
          ? { display: "grid", gap: 12 }
          : { display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }
      }
    >
      <Link
        className="nav-link"
        href="/c/диоптрични-рамки"
        onClick={onNavigate}
      >
        Диоптрични рамки
      </Link>

      <Link
        className="nav-link"
        href="/c/слънчеви-очила"
        onClick={onNavigate}
      >
        Слънчеви очила
      </Link>

      {isMobile ? (
        <Link
          className="nav-link"
          href="/account"
          onClick={onNavigate}
        >
          Моят профил
        </Link>
      ) : (
        <HeaderAccount />
      )}

      <Link
        className="nav-link"
        href="/kontakti"
        onClick={onNavigate}
      >
        Контакти
      </Link>
    </nav>
  );
}
