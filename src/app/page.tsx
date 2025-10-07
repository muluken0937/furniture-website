// src/app/page.js
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import FeaturesCarousel from '@/components/FeaturesCarousel';
import HeroSection from '@/components/HeroSection';
import ShopByCategory from '@/components/ShopByCategory';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const categories = [
    {
      name: 'Sofas',
      image: '/images/gray-sofa.jpeg',
      productCount: '12 products'
    },
    {
      name: 'Beds',
      image: '/images/wooden-bed.jpg',
      productCount: '8 products'
    },
    {
      name: 'Dining',
      image: '/images/dinning table.webp',
      productCount: '15 products'
    },
    {
      name: 'Office',
      image: '/images/office table.jpeg',
      productCount: '10 products'
    }
  ];

  const heroFeatures = [
    {
      title: "Free Shipping",
      description: "On orders over $500",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    {
      title: "30-Day Returns",
      description: "No questions asked",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      title: "5-Year Warranty",
      description: "On all furniture",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Sustainable Materials",
      description: "Eco-friendly choices",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection>
        <h1 className="text-3xl font-bold text-white mb-4 max-w-3xl block md:hidden">Timeless Furniture</h1>
        <h1 className="hidden md:block text-5xl md:text-6xl font-bold text-white mb-6 max-w-3xl">Transform Your Space with Timeless Furniture</h1>
        <p className="text-base text-white mb-6 max-w-2xl block md:hidden">Handcrafted pieces that blend comfort and style.</p>
        <p className="hidden md:block text-xl text-white mb-10 max-w-2xl">Discover handcrafted pieces that blend comfort, style, and sustainability for your modern home.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-primary hover:bg-teal-800 text-white px-8 py-4 rounded-full text-lg font-medium transition duration-300 transform hover:scale-105">Shop Collection</button>
          <button className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-full text-lg font-medium transition duration-300">Explore Designs</button>
        </div>
      </HeroSection>

      {/* Features section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Mobile: carousel; Desktop: static grid */}
          <div className="md:hidden">
            <FeaturesCarousel features={heroFeatures} />
          </div>

          <div className="hidden md:grid md:grid-cols-4 gap-4">
            {heroFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-2 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="bg-primary-100 text-primary p-2 rounded-full mb-2">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1 truncate">{feature.title}</h3>
                <p className="text-gray-600 text-sm truncate">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ShopByCategory categories={categories} />
      
      {/* Product showcase */}
      <main className="flex-grow container mx-auto px-4 py-16">
        <ProductGrid selectedCategory="" selectedType="" isHomePage={true} />
        <div className="text-center mt-12">
          <Link href="/products" className="border-2 border-primary text-primary px-8 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition">
            View All Products
          </Link>
        </div>
      </main>
      
      {/* Testimonial section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6">&ldquo;The quality of the sofa exceeded my expectations. It&apos;s comfortable, stylish, and has transformed my living room.&rdquo;</p>
                <div className="flex items-center">
                  <div className="relative w-12 h-12 mr-4 overflow-hidden rounded-xl">
                    <Image 
                      src="/images/testmony.png" 
                      alt="Customer testimonial" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-gray-600">Interior Designer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Newsletter</h2>
          <p className="text-primary-100 mb-8">Subscribe to get special offers, free giveaways, and new product announcements</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-6 py-4 rounded-full flex-grow max-w-md"
            />
            <button className="bg-white text-primary px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}