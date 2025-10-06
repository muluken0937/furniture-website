'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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
  image?: string;
  created_at: string;
  updated_at: string;
}

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/products/`);
      const data = await response.json();
      setProducts(data.results || data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/products/${productId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProducts();
      } else {
        console.error('Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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
        <div className="space-y-6">
          {/* Header with Add Product Button */}
          <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-accent/20">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="mt-2 text-gray-600">Manage your furniture products</p>
            </div>
              <button 
              onClick={() => router.push('/admin/products/add')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl bg-secondary-var"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Product
            </button>
          </div>

          {/* Products List */}
          {products.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-accent/20 flex items-center justify-center">
                              <span className="text-accent text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {product.name}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.is_active ? 'bg-success/20 text-success' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                          <p className="text-sm text-gray-500">
                            Category: {product.category.name} | Price: ${product.price} | Stock: {product.stock}
                          </p>
                          {product.sku && (
                            <p className="text-xs text-accent mt-1">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-accent/20">
              <div className="mx-auto h-24 w-24 text-accent mb-6">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first furniture product. Add products to build your catalog and start selling.
              </p>
              <button
                onClick={() => router.push('/admin/products/add')}
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#a16207' }}
              >
                <PlusIcon className="w-6 h-6 mr-3" />
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
