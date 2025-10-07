"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Filter state
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    priceRange: 'all',
    sort: 'featured',
    search: ''
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    const type = searchParams.get('type') || 'all';
    const priceRange = searchParams.get('priceRange') || 'all';
    const sort = searchParams.get('sort') || 'featured';
    const search = searchParams.get('search') || '';
    
    setFilters({ category, type, priceRange, sort, search });
  }, [searchParams]);

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    if (updatedFilters.category !== 'all') params.set('category', updatedFilters.category);
    if (updatedFilters.type !== 'all') params.set('type', updatedFilters.type);
    if (updatedFilters.priceRange !== 'all') params.set('priceRange', updatedFilters.priceRange);
    if (updatedFilters.sort !== 'featured') params.set('sort', updatedFilters.sort);
    if (updatedFilters.search !== '') params.set('search', updatedFilters.search);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    router.push(newUrl);
  };

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    updateFilters({ category });
  };

  const handleTypeChange = (type: string) => {
    updateFilters({ type });
  };

  const handlePriceRangeChange = (priceRange: string) =>
    updateFilters({ priceRange });
;

  const handleSortChange = (sort: string) => {
    updateFilters({ sort });
  };

  const handleSearchChange = (search: string) => {
    updateFilters({ search });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ category: 'all', type: 'all', priceRange: 'all', sort: 'featured', search: '' });
    router.push('/products');
  };

  // Convert price range string to array for ProductGrid
  const getPriceRangeArray = (priceRange: string): [number, number] => {
    switch (priceRange) {
      case '0': return [0, 100];
      case '1': return [100, 500];
      case '2': return [500, 1000];
      case '3': return [1000, 2000];
      case '4': return [2000, 10000];
      default: return [0, 10000];
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
            <p className="text-gray-600">Discover our collection of premium furniture for every space</p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mt-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {filters.search && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col lg:flex-row lg:bg-white lg:rounded-lg lg:shadow-md lg:overflow-hidden lg:h-[calc(100vh-200px)]">
            {/* Filters Section - Left Side */}
            <div className="lg:w-1/6 lg:border-r lg:border-gray-200 lg:flex lg:flex-col">
              <div className="bg-gray-50 px-4 pb-6 pt-0 lg:sticky lg:top-16 lg:h-full lg:overflow-y-auto">
                <h2 className="text-xl font-semibold mb-6">Filters</h2>
                
                {/* Category Filter */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="category" 
                          value="all" 
                          checked={filters.category === 'all'}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">All Categories</span>
                      </div>
                      <span className="text-gray-500 text-sm">(45)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="category" 
                          value="sofa" 
                          checked={filters.category === 'sofa'}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">Sofa</span>
                      </div>
                      <span className="text-gray-500 text-sm">(12)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="category" 
                          value="bed" 
                          checked={filters.category === 'bed'}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">Bed</span>
                      </div>
                      <span className="text-gray-500 text-sm">(8)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="category" 
                          value="chair" 
                          checked={filters.category === 'chair'}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">Chair</span>
                      </div>
                      <span className="text-gray-500 text-sm">(15)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="category" 
                          value="table" 
                          checked={filters.category === 'table'}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">Table</span>
                      </div>
                      <span className="text-gray-500 text-sm">(10)</span>
                    </label>
                  </div>
                </div>

                {/* Type Filter */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-4">Type</h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="type" 
                          value="all" 
                          checked={filters.type === 'all'}
                          onChange={(e) => handleTypeChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">All Types</span>
                      </div>
                      <span className="text-gray-500 text-sm">(45)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="type" 
                          value="office" 
                          checked={filters.type === 'office'}
                          onChange={(e) => handleTypeChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">Office</span>
                      </div>
                      <span className="text-gray-500 text-sm">(20)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="type" 
                          value="house" 
                          checked={filters.type === 'house'}
                          onChange={(e) => handleTypeChange(e.target.value)}
                          className="mr-3 text-primary focus:ring-primary" 
                        />
                        <span className="text-gray-700">House</span>
                      </div>
                      <span className="text-gray-500 text-sm">(25)</span>
                    </label>
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-4">Price Range</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="priceRange" 
                        value="all" 
                        checked={filters.priceRange === 'all'}
                        onChange={(e) => handlePriceRangeChange(e.target.value)}
                        className="mr-3 text-primary focus:ring-primary" 
                      />
                      <span className="text-gray-700">All Prices</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="priceRange" 
                        value="0" 
                        checked={filters.priceRange === '0'}
                        onChange={(e) => handlePriceRangeChange(e.target.value)}
                        className="mr-3 text-primary focus:ring-primary" 
                      />
                      <span className="text-gray-700">Under $100</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="priceRange" 
                        value="1" 
                        checked={filters.priceRange === '1'}
                        onChange={(e) => handlePriceRangeChange(e.target.value)}
                        className="mr-3 text-primary focus:ring-primary" 
                      />
                      <span className="text-gray-700">$100 - $500</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="priceRange" 
                        value="2" 
                        checked={filters.priceRange === '2'}
                        onChange={(e) => handlePriceRangeChange(e.target.value)}
                        className="mr-3 text-primary focus:ring-primary" 
                      />
                      <span className="text-gray-700">$500 - $1000</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="priceRange" 
                        value="3" 
                        checked={filters.priceRange === '3'}
                        onChange={(e) => handlePriceRangeChange(e.target.value)}
                        className="mr-3 text-primary focus:ring-primary" 
                      />
                      <span className="text-gray-700">$1000 - $2000</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="priceRange" 
                        value="4" 
                        checked={filters.priceRange === '4'}
                        onChange={(e) => handlePriceRangeChange(e.target.value)}
                        className="mr-3 text-primary focus:ring-primary" 
                      />
                      <span className="text-gray-700">Over $2000</span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <button 
                  onClick={clearFilters}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Product List Section - Right Side */}
            <div className="lg:w-5/6 lg:pl-6 lg:flex lg:flex-col lg:h-full">
              <div className="p-6 lg:flex-1 lg:overflow-y-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <span className="text-gray-600">
                      Showing results for: {filters.category === 'all' ? 'All Categories' : filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}
                      {filters.search && ` - "${filters.search}"`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Sort by:</span>
                    <select 
                      value={filters.sort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                      <option value="rating">Best Rated</option>
                    </select>
                  </div>
                </div>

                <ProductGrid 
                  selectedCategory={filters.category}
                  selectedType={filters.type}
                  priceRange={getPriceRangeArray(filters.priceRange)}
                  sortBy={filters.sort}
                  searchQuery={filters.search}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



