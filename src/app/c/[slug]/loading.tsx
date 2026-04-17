export default function CategoryLoading() {
  return (
    <main className="container">
      <header className="cat-hero">
        <div className="cat-hero-top">
          <div
            style={{
              height: 34,
              width: 220,
              borderRadius: 10,
              background: "rgba(0,0,0,0.08)",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 40,
              width: 180,
              borderRadius: 12,
              background: "rgba(0,0,0,0.08)",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          />
        </div>

        <div className="filter-row">
          <div className="filter-scroll">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 38,
                  width: i === 0 ? 84 : 96,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.08)",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="products-grid grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="card" aria-hidden="true">
            <div
              className="pmedia"
              style={{
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  bottom: 14,
                  width: 92,
                  height: 28,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.7)",
                }}
              />
            </div>

            <div
              className="pname"
              style={{
                minHeight: 44,
              }}
            >
              <div
                style={{
                  height: 14,
                  width: "88%",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.08)",
                  animation: "pulse 1.2s ease-in-out infinite",
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  height: 14,
                  width: "56%",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.08)",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <section className="cat-seo">
        <div
          style={{
            height: 28,
            width: 260,
            borderRadius: 10,
            background: "rgba(0,0,0,0.08)",
            animation: "pulse 1.2s ease-in-out infinite",
            marginBottom: 16,
          }}
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 16,
              width: i === 2 ? "78%" : "100%",
              borderRadius: 8,
              background: "rgba(0,0,0,0.08)",
              animation: "pulse 1.2s ease-in-out infinite",
              marginBottom: 12,
            }}
          />
        ))}
      </section>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.55; }
          50% { opacity: 1; }
          100% { opacity: 0.55; }
        }
      `}</style>
    </main>
  );
}
