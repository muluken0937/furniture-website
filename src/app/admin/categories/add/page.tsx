'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { FURNITURE_CATEGORIES } from '@/constants/productConstants';
import { CategoryFormData } from '@/types/category';
import { getApiHeaders, extractErrorMessage, validateCategoryName } from '@/utils/apiHelpers';

const AddCategoryPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = getApiUrl();

  const handleInputChange = (name: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuickSelect = (categoryName: string) => {
    setFormData(prev => ({
      ...prev,
      name: categoryName,
      description: prev.description || `Products in the ${categoryName} category`
    }));
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
      const response = await fetch(`${apiUrl}/api/categories/`, {
        method: 'POST',
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
        console.error('Error saving category:', errorData);
        setFormErrors({ name: extractErrorMessage(errorData, 'Failed to create category. Please try again.') });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setFormErrors({ name: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Add New Category</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                Create a new product category to organize your furniture items
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
                    placeholder="Enter category name (e.g., Sofa, Bed, Chair)"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                {/* Quick Select Common Categories */}
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Quick Select from Common Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {FURNITURE_CATEGORIES.slice(0, 12).map((categoryName) => (
                      <button
                        key={categoryName}
                        type="button"
                        onClick={() => handleQuickSelect(categoryName)}
                        className="px-2 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        {categoryName}
                      </button>
                    ))}
                  </div>
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
                    {submitting ? 'Creating...' : 'Create Category'}
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

export default AddCategoryPage;

