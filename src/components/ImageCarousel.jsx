"use client";

import { useState, useRef } from "react";

const ImageCarousel = ({ images = [], alt = "Property" }) => {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const urls = images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);

  if (urls.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center bg-gray-100 text-xs text-gray-400 md:h-72">
        No image available
      </div>
    );
  }

  const goTo = (index) => {
    if (index < 0) index = urls.length - 1;
    if (index >= urls.length) index = 0;
    setCurrent(index);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      goTo(current + 1);
    } else if (diff < -threshold) {
      goTo(current - 1);
    }
  };

  return (
    <div className="relative h-48 w-full overflow-hidden bg-slate-900 sm:h-60 md:h-72">
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {urls.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`${alt} ${idx + 1}`}
            className="h-full w-full shrink-0 object-contain"
          />
        ))}
      </div>

      {urls.length > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-xs text-black shadow-sm transition hover:bg-white sm:flex"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-xs text-black shadow-sm transition hover:bg-white sm:flex"
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

      {urls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {urls.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-1 rounded-full transition-all ${
                idx === current ? "w-4 bg-cyan-500" : "w-1 bg-white/70"
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;