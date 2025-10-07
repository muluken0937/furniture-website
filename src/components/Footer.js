// src/components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Habitsh Furniture</h3>
            <p className="text-gray-400 mb-4 max-w-md text-sm">
              Premium furniture for modern living spaces. Quality craftsmanship and sustainable materials designed to last.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4 items-center">
              {[
                { id: 'facebook', href: 'https://facebook.com', label: 'Facebook' },
                { id: 'twitter', href: 'https://twitter.com', label: 'Twitter' },
                { id: 'instagram', href: 'https://instagram.com', label: 'Instagram' },
                { id: 'pinterest', href: 'https://pinterest.com', label: 'Pinterest' },
              ].map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-800 p-2 rounded-full hover:bg-primary hover:text-white transition flex items-center justify-center"
                >
                  {s.id === 'facebook' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.47h-1.26c-1.242 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.99 22 12z" />
                    </svg>
                  )}
                  {s.id === 'twitter' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.6 8.6 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.3 3.9A12.14 12.14 0 0 1 3.16 4.9a4.28 4.28 0 0 0 1.33 5.71 4.24 4.24 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2c-.49.13-1.01.2-1.55.2-.38 0-.75-.04-1.11-.1a4.29 4.29 0 0 0 4 2.97A8.58 8.58 0 0 1 2 19.54a12.1 12.1 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2l-.01-.56A8.72 8.72 0 0 0 22.46 6z" />
                    </svg>
                  )}
                  {s.id === 'instagram' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A3.5 3.5 0 1 0 15.5 12 3.5 3.5 0 0 0 12 8.5zm4.8-3.9a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2z" />
                    </svg>
                  )}
                  {s.id === 'pinterest' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.43 7.56 5.92 9.08-.08-.77-.15-1.95.03-2.79.16-.68 1.03-4.34 1.03-4.34s-.26-.52-.26-1.29c0-1.21.7-2.12 1.57-2.12.74 0 1.1.56 1.1 1.23 0 .75-.48 1.87-.73 2.91-.21.88.45 1.6 1.33 1.6 1.6 0 2.84-1.68 2.84-4.09 0-2.14-1.54-3.64-3.74-3.64-2.55 0-4.06 1.9-4.06 3.87 0 .76.29 1.58.66 2.03.07.08.08.15.06.23-.07.25-.23.78-.26.89-.04.14-.14.17-.33.1-1.18-.55-1.92-2.25-1.92-3.62 0-2.95 2.14-5.66 6.17-5.66 3.24 0 5.76 2.31 5.76 5.4 0 3.22-2.03 5.82-4.85 5.82-0.95 0-1.84-.49-2.14-1.07 0 0-.5 1.9-.62 2.32-.22.79-.65 1.58-1.05 2.21C9.46 21.85 10.7 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
          
          {/* Shop + Help combined into two columns while preserving rows */}
          <div className="sm:col-span-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-base mb-2">Shop</h4>
                <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                  {['All Products', 'Living Room', 'Bedroom', 'Dining', 'Office', 'Outdoor'].map(item => (
                    <li key={item} className="hover:text-white cursor-pointer py-0.5">{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-base mb-2">Help</h4>
                <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                  {['Customer Service', 'Track Order', 'Returns & Exchanges', 'Shipping Info', 'FAQ'].map(item => (
                    <li key={item} className="hover:text-white cursor-pointer py-0.5">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-base mb-2">Contact</h4>
            <ul className="flex flex-col gap-2 text-gray-400 text-sm">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                2P5J+H79, Addis Ababa, Ethiopia
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (555) 123-4567
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@habitshfurniture.com
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 md:flex md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">© {new Date().getFullYear()} Habitsh Furniture. All rights reserved.</div>
          <div className="text-sm text-gray-400">Designed with care · Privacy · Terms</div>
        </div>
      </div>
    </footer>
  );
}