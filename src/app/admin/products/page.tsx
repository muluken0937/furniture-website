'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders, extractErrorMessage, handleTokenExpiration } from '@/utils/apiHelpers';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProductImage {
  id: number;
  image: string;
  order: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku?: string;
  category: {
    id: number;
    name: string;
  };
  is_active: boolean;
  image?: string; // Legacy single image field
  images?: ProductImage[]; // Multiple images array
  created_at: string;
  updated_at: string;
}

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchProducts();
    // fetchProducts is stable within this component; intentionally not added to deps
    // to avoid recreating the function every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    if (!apiUrl) {
      setError('API URL is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/products/`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
      const data = await response.json();
      setProducts(data.results || data);
        setError(null);
      } else {
        // Handle token expiration
        if (handleTokenExpiration(response)) {
          return;
        }
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          const errorMsg = 'Authentication failed. Please log in again.';
          setError(errorMsg);
          toast.error(errorMsg);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = extractErrorMessage(errorData, 'Failed to fetch products. Please try again.');
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    // Use a custom confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) {
      return;
    }

    // Check if API URL is configured
    if (!apiUrl) {
      toast.error('API URL is not configured. Please check your environment variables.');
      return;
    }

    // Check if token exists
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    const deleteToast = toast.loading('Deleting product...');

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/products/${productId}/`, {
        method: 'DELETE',
        headers: headers,
      });

      // Handle token expiration
      if (handleTokenExpiration(response)) {
        toast.dismiss(deleteToast);
        return;
      }

      // Handle successful deletion (204 No Content or 200 OK)
      if (response.ok || response.status === 204) {
        toast.success('Product deleted successfully!', { id: deleteToast });
        await fetchProducts();
      } else {
        // Try to parse error response
        let errorMessage = 'Failed to delete product. Please try again.';
        
        // Only try to read response body if there's content
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        if (contentType && contentType.includes('application/json') && contentLength !== '0') {
          try {
            const errorData = await response.json();
            errorMessage = extractErrorMessage(errorData, errorMessage);
          } catch (parseError) {
            // If JSON parsing fails, use status text
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else if (contentLength && contentLength !== '0') {
          // Try to read as text if not JSON
          try {
            const text = await response.text();
            errorMessage = text || `Server error: ${response.status} ${response.statusText}`;
          } catch (textError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          // Empty response, use status code
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          toast.error('Authentication failed. Please log in again.', { id: deleteToast });
        } else {
          toast.error(errorMessage, { id: deleteToast });
        }
      }
    } catch (error) {
      // Handle network errors or connection issues
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error. Please check your connection and try again.', { id: deleteToast });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
        toast.error(errorMessage, { id: deleteToast });
      }
    }
  };

  const handleEdit = (product: Product) => {
    router.push(`/admin/products/edit/${product.id}`);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="staff">
        <AdminLayout>
              <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-secondary)' }}></div>
            </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="staff">
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          {/* Header with Add Product Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-accent/20">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage your furniture products</p>
            </div>
              <button 
              onClick={() => router.push('/admin/products/add')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl bg-secondary-var"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add Product
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Products List */}
          {products.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id}>
                    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start sm:items-center w-full sm:w-auto min-w-0">
                        <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 relative">
                          {(() => {
                            // Get the first image from images array or fallback to legacy image field
                            const firstImage = product.images && product.images.length > 0 
                              ? product.images[0].image 
                              : product.image;
                            
                            if (firstImage) {
                              const imageUrl = firstImage.startsWith('http') ? firstImage : `${apiUrl}${firstImage}`;
                              const imageCount = product.images?.length || (product.image ? 1 : 0);
                              
                              return (
                                <>
                                  <img 
                                    src={imageUrl}
                              alt={product.name}
                              className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover"
                                    onError={(e) => {
                                      // Fallback if image fails to load - replace with placeholder
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const placeholder = document.createElement('div');
                                      placeholder.className = 'h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-accent/20 flex items-center justify-center';
                                      placeholder.innerHTML = '<span class="text-accent text-xs">No Image</span>';
                                      if (target.parentElement) {
                                        target.parentElement.appendChild(placeholder);
                                      }
                                    }}
                                  />
                                  {imageCount > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                      {imageCount}
                                    </div>
                                  )}
                                </>
                              );
                            } else {
                              return (
                            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-accent/20 flex items-center justify-center">
                              <span className="text-accent text-xs">No Image</span>
                            </div>
                              );
                            }
                          })()}
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <span className={`sm:ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                              product.is_active ? 'bg-success/20 text-success' : 'bg-red-100 text-red-800'
                            }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <p className="text-xs sm:text-sm text-gray-500">
                              <span className="font-medium">Category:</span> {product.category.name}
                            </p>
                            <span className="hidden sm:inline text-gray-400">|</span>
                            <p className="text-xs sm:text-sm text-gray-500">
                              <span className="font-medium">Price:</span> ${product.price}
                            </p>
                            <span className="hidden sm:inline text-gray-400">|</span>
                            <p className="text-xs sm:text-sm text-gray-500">
                              <span className="font-medium">Stock:</span> {product.stock}
                            </p>
                          </div>
                          {product.sku && (
                            <p className="text-xs text-accent mt-1">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-accent hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all duration-200"
                          title="Edit product"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-accent hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete product"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-8 sm:py-12 lg:py-16 bg-white rounded-lg shadow-sm border border-accent/20 px-4">
              <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-accent mb-4 sm:mb-6">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                Get started by creating your first furniture product. Add products to build your catalog and start selling.
              </p>
              <button
                onClick={() => router.push('/admin/products/add')}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base lg:text-lg font-medium rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#a16207' }}
              >
                <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default ProductsPage;
