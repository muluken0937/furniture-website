'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryFormData } from '@/types/category';
import { getApiHeaders, extractErrorMessage, validateCategoryName } from '@/utils/apiHelpers';

const EditCategoryPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { token } = useAuth();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/categories/${categoryId}/`, {
        method: 'GET',
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          description: data.description || '',
        });
      } else {
        setFormErrors({ name: 'Category not found' });
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setFormErrors({ name: 'Failed to load category' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const nameError = validateCategoryName(formData.name);
    if (nameError) {
      errors.name = nameError;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/categories/${categoryId}/`, {
        method: 'PUT',
        headers: getApiHeaders(token),
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || '',
        }),
      });

      if (response.ok) {
        router.push('/admin/categories');
      } else {
        const errorData = await response.json();
        console.error('Error updating category:', errorData);
        setFormErrors({ name: extractErrorMessage(errorData, 'Failed to update category. Please try again.') });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setFormErrors({ name: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent hover:text-gray-700 hover:bg-accent/10 rounded-lg border border-accent/20 hover:border-accent/40 transition-all duration-200 group mb-4"
            >
              <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Categories</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="text-center px-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Edit Category</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                Update category information
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg border border-accent/20 overflow-hidden">
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/30 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                Category Information
              </h2>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-white to-accent/5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    placeholder="Enter category name"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    placeholder="Enter category description (optional)"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 sm:px-6 py-2 border border-accent/40 rounded-lg text-sm font-medium text-gray-700 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 sm:px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#a16207' }}
                  >
                    {submitting ? 'Updating...' : 'Update Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default EditCategoryPage;

