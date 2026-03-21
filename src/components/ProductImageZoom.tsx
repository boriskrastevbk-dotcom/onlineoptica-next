"use client";

import { useEffect, useRef, useState } from "react";

type Img = {
  src: string;
  alt?: string;
};

export default function ProductImageZoom({
  images,
  initialIndex = 0,
}: {
  images: Img[];
  initialIndex?: number;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initialIndex);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const prev = () =>
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  const next = () =>
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (delta > 50) prev();
    if (delta < -50) next();

    touchStartX.current = null;
  };

  if (!images.length) return null;

  return (
    <>
      <div className="product-main-image" onClick={() => setOpen(true)}>
        <img src={images[index].src} alt={images[index].alt || ""} />
      </div>

      {open && (
        <div
          className="image-lightbox"
          onClick={() => setOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            className="lightbox-arrow left"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            ‹
          </button>

          <img
            src={images[index].src}
            alt={images[index].alt || ""}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="lightbox-arrow right"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
