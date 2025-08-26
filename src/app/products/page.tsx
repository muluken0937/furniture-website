import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-gray-50 py-4">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
            <p className="text-gray-600">Discover our collection of premium furniture for every space</p>
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
                        <input type="radio" name="category" value="all" className="mr-3 text-primary focus:ring-primary" />
                        <span className="text-gray-700">All Categories</span>
                      </div>
                      <span className="text-gray-500 text-sm">(45)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input type="radio" name="category" value="sofa" className="mr-3 text-primary focus:ring-primary" />
                        <span className="text-gray-700">Sofa</span>
                      </div>
                      <span className="text-gray-500 text-sm">(12)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input type="radio" name="category" value="bed" className="mr-3 text-primary focus:ring-primary" />
                        <span className="text-gray-700">Bed</span>
                      </div>
                      <span className="text-gray-500 text-sm">(8)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input type="radio" name="category" value="chair" className="mr-3 text-primary focus:ring-primary" />
                        <span className="text-gray-700">Chair</span>
                      </div>
                      <span className="text-gray-500 text-sm">(15)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input type="radio" name="category" value="table" className="mr-3 text-primary focus:ring-primary" />
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
                        <input type="radio" name="type" value="all" className="mr-3 text-primary focus:ring-primary" />
                        <span className="text-gray-700">All Types</span>
                      </div>
                      <span className="text-gray-500 text-sm">(45)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input type="radio" name="type" value="office" className="mr-3 text-primary focus:ring-primary" />
                        <span className="text-gray-700">Office</span>
                      </div>
                      <span className="text-gray-500 text-sm">(20)</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input type="radio" name="type" value="house" className="mr-3 text-primary focus:ring-primary" />
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
                      <input type="radio" name="priceRange" value="0" className="mr-3 text-primary focus:ring-primary" />
                      <span className="text-gray-700">Under $100</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="priceRange" value="1" className="mr-3 text-primary focus:ring-primary" />
                      <span className="text-gray-700">$100 - $500</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="priceRange" value="2" className="mr-3 text-primary focus:ring-primary" />
                      <span className="text-gray-700">$500 - $1000</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="priceRange" value="3" className="mr-3 text-primary focus:ring-primary" />
                      <span className="text-gray-700">$1000 - $2000</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="priceRange" value="4" className="mr-3 text-primary focus:ring-primary" />
                      <span className="text-gray-700">Over $2000</span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition duration-200">
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
                      Showing results for: All Categories
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Sort by:</span>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest</option>
                      <option>Best Rated</option>
                    </select>
                  </div>
                </div>

                <ProductGrid 
                  selectedCategory="all"
                  selectedType="all"
                  priceRange={[0, 5000]}
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