'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types/category';
import { getApiHeaders, parseApiResponse, extractErrorMessage } from '@/utils/apiHelpers';

const CategoriesPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/categories/`, {
        method: 'GET',
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      setCategories(parseApiResponse<Category>(data));
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/categories/${categoryId}/`, {
        method: 'DELETE',
        headers: getApiHeaders(token),
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const errorData = await response.json();
        alert(`Error deleting category: ${extractErrorMessage(errorData, 'Unknown error')}`);
      }
    } catch (error) {
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleEdit = (category: Category) => {
    router.push(`/admin/categories/edit/${category.id}`);
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
          {/* Header with Add Category Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-accent/20">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Categories</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage product categories</p>
            </div>
            <button 
              onClick={() => router.push('/admin/categories/add')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl bg-secondary-var"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add Category
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Categories List */}
          {categories.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <li key={category.id}>
                    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start sm:items-center w-full sm:w-auto min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                              {category.name}
                            </h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {category.slug}
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <p className="text-xs text-gray-500">
                              Created: {new Date(category.created_at).toLocaleDateString()}
                            </p>
                            {category.products !== undefined && (
                              <>
                                <span className="text-gray-400">|</span>
                                <p className="text-xs text-gray-500">
                                  {category.products} product{category.products !== 1 ? 's' : ''}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <button 
                          onClick={() => handleEdit(category)}
                          className="p-2 text-accent hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all duration-200"
                          title="Edit category"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 text-accent hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete category"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                Get started by creating your first category. Categories help organize your products and make them easier to find.
              </p>
              <button
                onClick={() => router.push('/admin/categories/add')}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent text-sm sm:text-base lg:text-lg font-medium rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#a16207' }}
              >
                <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Add Your First Category
              </button>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default CategoriesPage;

