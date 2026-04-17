export default function ProductLoading() {
  return (
    <main className="container" style={{ padding: 24 }}>
      <div
        className="oo-product-grid"
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "520px 1fr",
          gap: 18,
        }}
      >
        <section>
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 24,
              background: "rgba(0,0,0,0.08)",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          />
        </section>

        <section style={{ maxWidth: 520 }}>
          <div
            style={{
              height: 38,
              width: "82%",
              borderRadius: 10,
              background: "rgba(0,0,0,0.08)",
              animation: "pulse 1.2s ease-in-out infinite",
              marginBottom: 10,
            }}
          />

          <div
            style={{
              height: 28,
              width: 180,
              borderRadius: 10,
              background: "rgba(0,0,0,0.08)",
              animation: "pulse 1.2s ease-in-out infinite",
              marginBottom: 14,
            }}
          />

          <div
            style={{
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: 14,
                width: "100%",
                borderRadius: 8,
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
                marginBottom: 10,
              }}
            />
            <div
              style={{
                height: 14,
                width: "92%",
                borderRadius: 8,
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
                marginBottom: 10,
              }}
            />
            <div
              style={{
                height: 14,
                width: "64%",
                borderRadius: 8,
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
          </div>

          <div
            style={{
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
              padding: 16,
            }}
          >
            <div
              style={{
                height: 42,
                width: "100%",
                borderRadius: 12,
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
                marginBottom: 12,
              }}
            />
            <div
              style={{
                height: 42,
                width: "100%",
                borderRadius: 12,
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
                marginBottom: 12,
              }}
            />
            <div
              style={{
                height: 48,
                width: "100%",
                borderRadius: 14,
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
          </div>
        </section>
      </div>

      <div
        style={{
          marginTop: 18,
          borderTop: "1px solid rgba(0,0,0,0.12)",
          paddingTop: 12,
        }}
      >
        <section
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff",
          }}
        >
          <div
            style={{
              height: 26,
              width: 220,
              borderRadius: 10,
              background: "rgba(0,0,0,0.08)",
              animation: "pulse 1.2s ease-in-out infinite",
              marginBottom: 14,
            }}
          />

          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 14,
                width: i === 4 ? "72%" : "100%",
                borderRadius: 8,
                background: "rgba(0,0,0,0.08)",
                animation: "pulse 1.2s ease-in-out infinite",
                marginBottom: 12,
              }}
            />
          ))}
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.55; }
          50% { opacity: 1; }
          100% { opacity: 0.55; }
        }

        @media (max-width: 980px) {
          .oo-product-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
