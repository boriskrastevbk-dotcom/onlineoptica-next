"use client";

import { useMemo, useState } from "react";

export default function ShortDescriptionClamp(props: {
  html: string;
  lines?: 3 | 4 | 5;
}) {
  const [expanded, setExpanded] = useState(false);
  const lines = props.lines ?? 4;

  // Ако съдържанието е празно/само тагове – не показвай нищо
  const hasMeaningfulText = useMemo(() => {
    const text = props.html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 0;
  }, [props.html]);

  if (!hasMeaningfulText) return null;

  return (
    <section style={{ margin: "10px 0 14px" }}>

      <div
        style={{
          lineHeight: 1.5,
          opacity: 0.95,
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: String(lines),
                overflow: "hidden",
              }),
        }}
        dangerouslySetInnerHTML={{ __html: props.html }}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          marginTop: 6,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontWeight: 800,
          opacity: 0.85,
          textDecoration: "underline",
        }}
        aria-expanded={expanded}
      >
        {expanded ? "Покажи по-малко" : "Покажи още"}
      </button>
    </section>
  );
}
