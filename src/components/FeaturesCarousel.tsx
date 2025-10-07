"use client";

import React, { useEffect, useRef, useState } from 'react';

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function FeaturesCarousel({ features = [] }: { features?: Feature[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const total = features.length;

  // start auto sliding
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % total);
    }, 3000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // total is stable for this effect; we purposely only depend on total
  }, [total]);

  if (total === 0) return null;

  const handlePrev = () => setIndex((i) => (i - 1 + total) % total);
  const handleNext = () => setIndex((i) => (i + 1) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    pausedRef.current = true;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    const delta = touchDeltaX.current;
    const threshold = 40; // px
    if (delta > threshold) {
      handlePrev();
    } else if (delta < -threshold) {
      handleNext();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    // resume after short delay
    setTimeout(() => { pausedRef.current = false; }, 500);
  };

  const slides = features; // single set, we wrap using modulo
  const translateX = -index * 50; // each slide is 50% width (two visible)

  return (
    <div className="w-full overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <div
          className="flex"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            transform: `translateX(${translateX}%)`,
            transition: 'transform 400ms ease'
          }}
        >
          {slides.map((f, i) => (
            <div key={i} className="flex-shrink-0 w-1/2 p-2">
              <div className="bg-white rounded-xl shadow-sm flex flex-col items-center text-center h-auto p-2 max-h-40">
                <div className="bg-primary-100 text-primary p-2 rounded-full mb-2">
                  {f.icon}
                </div>
                <h3 className="text-xs font-bold mb-1 truncate">{f.title}</h3>
                <p className="text-gray-600 text-[11px] truncate">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


