"use client";
/* eslint-disable react-hooks/rules-of-hooks */

import React, { useEffect, useRef, useState } from 'react';

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function FeaturesCarousel({ features = [] }: { features?: Feature[] }) {
  const total = features.length;
  if (total === 0) return null;

  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  // keep an extended slides array (duplicated) so we can create a seamless loop
  const extendedSlides = [...features, ...features];

  const transitionMs = 400;

  // start auto sliding
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (!pausedRef.current) setCurrentIndex((i) => i + 1);
    }, 3000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // total is stable for this effect; we purposely only depend on total
  }, [total]);


  const handlePrev = () => setCurrentIndex((i) => i - 1);
  const handleNext = () => setCurrentIndex((i) => i + 1);

  // when we advance past the original slides (i.e., reach index === total),
  // wait for the transition to finish then jump back to the original index
  useEffect(() => {
    if (currentIndex === total) {
      // after the transition ends, disable transition and reset index to 0
      const t = window.setTimeout(() => {
        setIsTransitionEnabled(false);
        setCurrentIndex((i) => i - total);
        // re-enable transition on next tick
        requestAnimationFrame(() => {
          // tiny timeout to ensure DOM updated
          setTimeout(() => setIsTransitionEnabled(true), 20);
        });
      }, transitionMs);
      return () => window.clearTimeout(t);
    }

    // also handle negative wrap (if user goes prev from 0 to -1)
    if (currentIndex === -1) {
      const t = window.setTimeout(() => {
        setIsTransitionEnabled(false);
        setCurrentIndex((i) => i + total);
        requestAnimationFrame(() => setTimeout(() => setIsTransitionEnabled(true), 20));
      }, transitionMs);
      return () => window.clearTimeout(t);
    }
  }, [currentIndex, total]);

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

  const slides = extendedSlides; // duplicated set for seamless looping
  const translateX = -currentIndex * 50; // each slide is 50% width (two visible)

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
            transition: isTransitionEnabled ? `transform ${transitionMs}ms ease` : 'none'
          }}
        >
          {slides.map((f, i) => (
            <div key={i} className="flex-shrink-0 w-1/2 p-1">
              <div className="bg-white rounded-lg shadow-sm flex flex-col items-center text-center h-auto p-1 max-h-32 lg:max-h-24">
                <div className="bg-primary-100 text-primary p-1.5 rounded-full mb-1">
                  {f.icon}
                </div>
                <h3 className="text-[11px] font-semibold mb-0.5 truncate">{f.title}</h3>
                <p className="text-gray-600 text-[10px] truncate">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


