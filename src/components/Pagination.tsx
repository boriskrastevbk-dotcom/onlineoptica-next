import Link from "next/link";

function buildPages(current: number, total: number, delta = 2) {
  if (total <= 1) return [1];

  const pages: (number | "...")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  pages.push(1);

  if (left > 2) pages.push("...");

  for (let p = left; p <= right; p++) pages.push(p);

  if (right < total - 1) pages.push("...");

  pages.push(total);

  return pages;
}

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
  query = {},
}: {
  basePath: string; // напр. `/c/${slug}`
  currentPage: number;
  totalPages: number;
  query?: Record<string, string | number | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPages(currentPage, totalPages, 2);

  const makeHref = (page: number) => {
    const sp = new URLSearchParams();

    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      sp.set(k, String(v));
    }

    sp.set("page", String(page));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <nav style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
      {/* Prev */}
      <Link
        href={makeHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.12)",
          opacity: currentPage === 1 ? 0.45 : 1,
          pointerEvents: currentPage === 1 ? "none" : "auto",
          background: "#fff",
        }}
      >
        ←
      </Link>

      {/* Numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} style={{ padding: "8px 10px", opacity: 0.6 }}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            style={{
              minWidth: 38,
              textAlign: "center",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.12)",
              background: p === currentPage ? "rgba(0,0,0,0.85)" : "#fff",
              color: p === currentPage ? "#fff" : "inherit",
              fontWeight: p === currentPage ? 800 : 600,
            }}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={makeHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.12)",
          opacity: currentPage === totalPages ? 0.45 : 1,
          pointerEvents: currentPage === totalPages ? "none" : "auto",
          background: "#fff",
        }}
      >
        →
      </Link>
    </nav>
  );
}
