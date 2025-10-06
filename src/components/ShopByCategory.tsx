"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function ShopByCategory({ categories }: { categories: { name: string; image: string; productCount: string }[] }) {
  return (
    <div className="relative z-10 bg-white py-12 shadow-lg">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/products?category=${category.name.toLowerCase()}`}
              className="bg-gray-50 rounded-xl p-4 sm:p-6 text-center hover:bg-primary hover:text-white transition duration-300 cursor-pointer group"
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 overflow-hidden rounded-xl">
                <Image src={category.image} alt={`${category.name} category`} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">{category.name}</h3>
              <p className="hidden sm:block text-gray-600 group-hover:text-white text-sm sm:text-base">{category.productCount}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


