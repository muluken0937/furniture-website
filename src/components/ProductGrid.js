// src/components/ProductGrid.js
import Image from 'next/image';

export default function ProductGrid({ selectedCategory = 'all', selectedType = 'all', priceRange = [0, 5000], isHomePage = false }) {
  const products = [
    { 
      id: 1, 
      name: 'Modern Sofa', 
      price: 899, 
      category: 'sofa', 
      type: 'house',
      image: '/images/gray-sofa.jpeg',
      rating: 4.8
    },
    { 
      id: 2, 
      name: 'Wooden Dining Table', 
      price: 1200, 
      category: 'table', 
      type: 'house',
      image: '/images/dinning table.webp',
      rating: 4.6
    },
    { 
      id: 3, 
      name: 'Ergonomic Office Chair', 
      price: 450, 
      category: 'chair', 
      type: 'office',
      image: '/images/linen-chair.jpeg',
      rating: 4.9
    },
    { 
      id: 4, 
      name: 'King Size Bed', 
      price: 1500, 
      category: 'bed', 
      type: 'house',
      image: '/images/wooden-bed.jpg',
      rating: 4.7
    },
    { 
      id: 5, 
      name: 'Office Desk', 
      price: 350, 
      category: 'table', 
      type: 'office',
      image: '/images/office table.jpeg',
      rating: 4.5
    },
    { 
      id: 6, 
      name: 'Leather Office Chair', 
      price: 650, 
      category: 'chair', 
      type: 'office',
      image: '/images/linen-chair.jpeg',
      rating: 4.8
    },
    { 
      id: 7, 
      name: 'Sectional Sofa', 
      price: 1800, 
      category: 'sofa', 
      type: 'house',
      image: '/images/sofa.jpg',
      rating: 4.9
    },
    { 
      id: 8, 
      name: 'Queen Size Bed', 
      price: 1200, 
      category: 'bed', 
      type: 'house',
      image: '/images/wooden-bed.jpg',
      rating: 4.6
    },
    { 
      id: 9, 
      name: 'Coffee Table', 
      price: 280, 
      category: 'table', 
      type: 'house',
      image: '/images/dinning table.webp',
      rating: 4.4
    },
    { 
      id: 10, 
      name: 'Accent Chair', 
      price: 320, 
      category: 'chair', 
      type: 'house',
      image: '/images/linen-chair.jpeg',
      rating: 4.7
    },
    { 
      id: 11, 
      name: 'Conference Table', 
      price: 2200, 
      category: 'table', 
      type: 'office',
      image: '/images/office table.jpeg',
      rating: 4.8
    },
    { 
      id: 12, 
      name: 'Loveseat', 
      price: 750, 
      category: 'sofa', 
      type: 'house',
      image: '/images/gray-sofa.jpeg',
      rating: 4.5
    }
  ];

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === '' || selectedCategory === 'all' || product.category === selectedCategory;
    const typeMatch = selectedType === '' || selectedType === 'all' || product.type === selectedType;
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return categoryMatch && typeMatch && priceMatch;
  });

  const ProductCard = ({ product, isHomePage = false }) => (
    <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition group ${isHomePage ? 'flex-shrink-0 w-80' : 'w-full'}`}>
            <div className="relative h-64">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
              <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-primary hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </span>
        </div>
            </div>
            <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 capitalize">{product.type}</span>
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">&star;</span>
            <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price}</span>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
  );

  return (
    <section>
      {(selectedCategory === '' || selectedCategory === 'all') && (selectedType === '' || selectedType === 'all') && (
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Featured Collection</h2>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">All</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Living Room</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Bedroom</button>
          </div>
        </div>
      )}
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters to find what you&apos;re looking for.</p>
        </div>
      ) : isHomePage ? (
        <div className="space-y-8">
          {/* First Row - Left to Right */}
          <div className="flex gap-6 pb-4 scrollbar-hide overflow-hidden">
            <div className="flex gap-6 animate-scroll-left">
              {filteredProducts.slice(0, Math.ceil(filteredProducts.length / 2)).map((product) => (
                <ProductCard key={product.id} product={product} isHomePage={true} />
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex gap-6 animate-scroll-left">
              {filteredProducts.slice(0, Math.ceil(filteredProducts.length / 2)).map((product) => (
                <ProductCard key={`duplicate-${product.id}`} product={product} isHomePage={true} />
              ))}
            </div>
      </div>
      
          {/* Second Row - Right to Left */}
          <div className="flex gap-6 pb-4 scrollbar-hide overflow-hidden">
            <div className="flex gap-6 animate-scroll-right">
              {filteredProducts.slice(Math.ceil(filteredProducts.length / 2)).map((product) => (
                <ProductCard key={product.id} product={product} isHomePage={true} />
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex gap-6 animate-scroll-right">
              {filteredProducts.slice(Math.ceil(filteredProducts.length / 2)).map((product) => (
                <ProductCard key={`duplicate-${product.id}`} product={product} isHomePage={true} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
      )}
    </section>
  );
}