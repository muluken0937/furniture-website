"use client";

import React, { useEffect, useRef, useState } from 'react';

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function FeaturesCarousel({ features }: { features: Feature[] }) {
  const visible = 2; // show two cards at a time
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timerRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const total = features.length;
  if (!features || total === 0) return null;

  useEffect(() => {
    // start auto sliding
    timerRef.current = window.setInterval(() => {
      setIsTransitioning(true);
      setIndex((i) => i + 1);
    }, 3000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // handle loop reset when index reaches total
    if (index > total) {
      // after transition to duplicate first slide, jump back to start without animation
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setIndex(1);
        // re-enable transition on next tick
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [index, total]);

  // build slides: duplicate features to allow seamless loop
  const slides = [...features, ...features];

  const translatePercent = -(index * (100 / (visible * (slides.length / visible)) )) * visible; // simplified below
  // simpler: each slide width = 50% so translate per index = index * 50%
  const translateX = -index * 50;

  return (
    <div className="w-full overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <div
          ref={trackRef}
          className="flex"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: isTransitioning ? 'transform 600ms ease' : 'none'
          }}
        >
          {slides.map((f, i) => (
            <div key={i} className="flex-shrink-0 w-1/2 md:w-1/4 p-2 md:p-4">
              <div className="bg-white rounded-xl shadow-sm flex flex-col items-center text-center h-auto p-2 md:p-4 max-h-44 md:max-h-48">
                <div className="bg-primary-100 text-primary p-2 md:p-3 rounded-full mb-2 md:mb-3">
                  {f.icon}
                </div>
                <h3 className="text-xs md:text-lg font-bold mb-1 md:mb-2 truncate">{f.title}</h3>
                <p className="text-gray-600 text-[11px] md:text-sm truncate">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


