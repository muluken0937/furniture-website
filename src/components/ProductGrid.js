// src/components/ProductGrid.js
import Image from 'next/image';

export default function ProductGrid() {
  const products = [
    { 
      id: 1, 
      name: 'Modern Sofa', 
      price: 899, 
      category: 'Living Room', 
      image: '/images/gray-sofa.jpeg',
      rating: 4.8
    },
    { 
      id: 2, 
      name: 'Wooden Dining Table', 
      price: 1200, 
      category: 'Dining', 
      image: '/images/linen-chair.jpeg',
      rating: 4.6
    },
    { 
      id: 3, 
      name: 'Ergonomic Chair', 
      price: 450, 
      category: 'Office', 
      image: '/images/linen-chair.jpeg',
      rating: 4.9
    },
    { 
      id: 4, 
      name: 'King Size Bed', 
      price: 1500, 
      category: 'Bedroom', 
      image: '/images/wooden-bed.jpg',
      rating: 4.7
    },
  ];

  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <h2 className="text-3xl font-bold">Featured Collection</h2>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">All</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Living Room</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Bedroom</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition group">
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
            </div>
            <div className="p-6">
              <span className="text-sm text-primary font-semibold">{product.category}</span>
              <h3 className="text-xl font-bold mt-2 mb-1">{product.name}</h3>
              
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">${product.price}</span>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <button className="border-2 border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition">
          View All Products
        </button>
      </div>
    </section>
  );
}