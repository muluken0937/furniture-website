"use client";

import Image from 'next/image';

export default function HeroSection({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.png"
          alt="Luxury Furniture"
          fill
          className="object-cover object-bottom md:object-center"
          priority
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-34 lg:py-44 flex flex-col items-center text-center min-h-[360px] md:min-h-[560px] lg:min-h-[660px]">
        {children}
      </div>
    </section>
  );
}


