'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders, extractErrorMessage } from '@/utils/apiHelpers';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  PRODUCT_MATERIALS,
  PRODUCT_STYLES,
  PRODUCT_COLORS,
  PRODUCT_FINISHES,
  ROOM_TYPES,
} from '@/constants/productConstants';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: number;
  is_active: boolean;
  image?: File;
  existingImageUrl?: string;
  material: string;
  style: string;
  color: string;
  finish: string;
  roomType: string;
}

const EditProductPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
    category: 0,
    is_active: true,
    material: '',
    style: '',
    color: '',
    finish: '',
    roomType: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchCategories = async () => {
    if (!apiUrl) return;

    try {
      const response = await fetch(`${apiUrl}/api/categories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        let categoriesList = [];
        if (Array.isArray(data)) {
          categoriesList = data;
        } else if (data.results && Array.isArray(data.results)) {
          categoriesList = data.results;
        } else if (data.results) {
          categoriesList = [data.results];
        }
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    if (!apiUrl || !productId) {
      setLoading(false);
      return;
    }

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/products/${productId}/`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        // Safely parse numbers, handling null/undefined/empty strings
        const parsePrice = (value: any): number => {
          if (value === null || value === undefined || value === '') return 0;
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        };

        const parseStock = (value: any): number => {
          if (value === null || value === undefined || value === '') return 0;
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? 0 : parsed;
        };

        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: parsePrice(data.price),
          stock: parseStock(data.stock),
          sku: data.sku || '',
          category: data.category?.id || data.category || 0,
          is_active: data.is_active !== undefined ? data.is_active : true,
          existingImageUrl: data.image || undefined,
          material: data.material || '',
          style: data.style || '',
          color: data.color || '',
          finish: data.finish || '',
          roomType: data.roomType || '',
        });
        if (data.image) {
          setImagePreview(data.image);
        }
      } else {
        if (response.status === 404) {
          const errorMsg = 'Product not found';
          setFormErrors({ _general: errorMsg });
          toast.error(errorMsg);
        } else {
          const errorMsg = 'Failed to load product';
          setFormErrors({ _general: errorMsg });
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = 'Failed to load product. Please try again.';
      setFormErrors({ _general: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (formData.category === 0) {
      errors.category = 'Please select a category';
    }
    if (formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (formData.stock < 0) {
      errors.stock = 'Stock cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if API URL is configured
    if (!apiUrl) {
      const errorMsg = 'API URL is not configured. Please check your environment variables.';
      setFormErrors({ _general: errorMsg });
      toast.error(errorMsg);
      return;
    }

    // Check if token exists
    if (!token) {
      const errorMsg = 'Authentication required. Please log in again.';
      setFormErrors({ _general: errorMsg });
      toast.error(errorMsg);
      return;
    }

    // Validate category is selected
    if (!formData.category || formData.category === 0) {
      setFormErrors({ category: 'Please select a category' });
      toast.error('Please select a category');
      return;
    }

    setSubmitting(true);
    const updateToast = toast.loading('Updating product...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stock', formData.stock.toString());
      // SKU is auto-generated by the backend, so we don't send it
      formDataToSend.append('category', formData.category.toString());
      formDataToSend.append('is_active', formData.is_active.toString());

      // Only append image if a new file is selected
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Get headers with Authorization but without Content-Type (FormData sets it automatically)
      const headers = getApiHeaders(token, false) as Record<string, string>;

      const response = await fetch(`${apiUrl}/api/products/${productId}/`, {
        method: 'PATCH',
        headers: headers,
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Product updated successfully!', { id: updateToast });
        router.push('/admin/products');
      } else {
        // Try to parse error response
        let errorData: any = {};
        const contentType = response.headers.get('content-type');
        let responseText = '';
        
        try {
          // Clone response to read it multiple times if needed
          const clonedResponse = response.clone();
          
          // First, try to get text
          responseText = await clonedResponse.text();
          
          // Try to parse as JSON
          if (contentType && contentType.includes('application/json')) {
            try {
              errorData = JSON.parse(responseText);
            } catch (jsonError) {
              // If JSON parsing fails, use the text as detail
              errorData = { detail: responseText || `Server error: ${response.status} ${response.statusText}` };
            }
          } else {
            // Not JSON, use text as error detail
            errorData = { detail: responseText || `Server error: ${response.status} ${response.statusText}` };
          }
        } catch (parseError) {
          errorData = { 
            detail: `Server error: ${response.status} ${response.statusText}. Failed to parse response.`,
            status: response.status,
            statusText: response.statusText
          };
        }

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          const errorMsg = 'Authentication failed. Please log in again.';
          setFormErrors({ _general: errorMsg });
          toast.error(errorMsg, { id: updateToast });
        } else if (response.status === 404) {
          const errorMsg = 'Product not found. It may have been deleted.';
          setFormErrors({ _general: errorMsg });
          toast.error(errorMsg, { id: updateToast });
        } else if (response.status === 400) {
          // Bad request - validation errors
          const errorMessage = extractErrorMessage(errorData, 'Validation failed. Please check your input.');
          if (errorData && typeof errorData === 'object') {
            // DRF validation errors are usually in this format
            const fieldErrors: Record<string, string> = {};
            Object.keys(errorData).forEach(key => {
              if (Array.isArray(errorData[key])) {
                fieldErrors[key] = errorData[key][0];
              } else if (typeof errorData[key] === 'string') {
                fieldErrors[key] = errorData[key];
              } else {
                fieldErrors[key] = String(errorData[key]);
              }
            });
            if (Object.keys(fieldErrors).length > 0) {
              setFormErrors(fieldErrors);
              // Show first field error in toast
              const firstError = Object.values(fieldErrors)[0];
              toast.error(firstError, { id: updateToast });
            } else {
              setFormErrors({ _general: errorMessage });
              toast.error(errorMessage, { id: updateToast });
            }
          } else {
            setFormErrors({ _general: errorMessage });
            toast.error(errorMessage, { id: updateToast });
          }
        } else {
          // Other errors
          const errorMessage = extractErrorMessage(errorData, `Failed to update product (${response.status}). Please try again.`);
          setFormErrors({ _general: errorMessage });
          toast.error(errorMessage, { id: updateToast });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setFormErrors({ _general: errorMessage });
      toast.error(errorMessage, { id: updateToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (name: string, value: string | number | boolean) => {
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result;
        if (typeof result === 'string') setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="staff">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="staff">
      <AdminLayout>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent hover:text-gray-700 hover:bg-accent/10 rounded-lg border border-accent/20 hover:border-accent/40 transition-all duration-200 group"
              >
                <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back to Products</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
            <div className="text-center px-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Edit Product</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                Update product information
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg border border-accent/20 overflow-hidden">
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/30 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                Product Information
              </h2>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-white to-accent/5">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* General Error Display */}
                {formErrors._general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{formErrors._general}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Enter product name"
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange('category', value === '' ? 0 : parseInt(value, 10));
                      }}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {loading
                          ? 'Loading categories...'
                          : categories.length === 0
                          ? 'No categories available'
                          : 'Select a category'}
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                  </div>

                  {/* Product Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                    {/* Material */}
                    <div>
                      <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <select
                        id="material"
                        value={formData.material}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      >
                        <option value="">Select material</option>
                        {PRODUCT_MATERIALS.map((material) => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Style */}
                    <div>
                      <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
                        Style
                      </label>
                      <select
                        id="style"
                        value={formData.style}
                        onChange={(e) => handleInputChange('style', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      >
                        <option value="">Select style</option>
                        {PRODUCT_STYLES.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color */}
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <select
                        id="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      >
                        <option value="">Select color</option>
                        {PRODUCT_COLORS.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Finish */}
                    <div>
                      <label htmlFor="finish" className="block text-sm font-medium text-gray-700 mb-1">
                        Finish
                      </label>
                      <select
                        id="finish"
                        value={formData.finish}
                        onChange={(e) => handleInputChange('finish', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      >
                        <option value="">Select finish</option>
                        {PRODUCT_FINISHES.map((finish) => (
                          <option key={finish} value={finish}>
                            {finish}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Room Type */}
                    <div>
                      <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type
                      </label>
                      <select
                        id="roomType"
                        value={formData.roomType}
                        onChange={(e) => handleInputChange('roomType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-sm"
                      >
                        <option value="">Select room type</option>
                        {ROOM_TYPES.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                    {/* Price */}
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        id="price"
                        value={isNaN(formData.price) ? '' : formData.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleInputChange('price', 0);
                          } else {
                            const parsed = parseFloat(value);
                            handleInputChange('price', isNaN(parsed) ? 0 : parsed);
                          }
                        }}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        placeholder="0.00"
                      />
                      {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
                    </div>

                    {/* Stock */}
                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        id="stock"
                        value={isNaN(formData.stock) ? '' : formData.stock}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            handleInputChange('stock', 0);
                          } else {
                            const parsed = parseInt(value, 10);
                            handleInputChange('stock', isNaN(parsed) ? 0 : parsed);
                          }
                        }}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        placeholder="0"
                      />
                      {formErrors.stock && <p className="text-red-500 text-sm mt-1">{formErrors.stock}</p>}
                    </div>
                  </div>

                  {/* SKU - Read-only (auto-generated) */}
                  <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                      SKU <span className="text-xs text-gray-500">(Auto-generated)</span>
                    </label>
                    <input
                      type="text"
                      id="sku"
                      value={formData.sku || 'Will be generated on save'}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Auto-generated SKU"
                    />
                    <p className="mt-1 text-xs text-gray-500">SKU is automatically generated by the system</p>
                  </div>

                  {/* Description */}
                  <div className="pt-2 border-t border-gray-200">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Enter product description"
                    />
                    {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                  </div>

                  {/* Product Image */}
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image
                    </label>
                    {imagePreview && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                        <img
                          src={imagePreview}
                          alt="Current product"
                          className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                    <div className="mt-1 flex justify-center px-3 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-accent transition-colors">
                      <div className="space-y-1 text-center">
                        <PhotoIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <div className="flex flex-col sm:flex-row text-xs sm:text-sm text-gray-600 items-center gap-1 sm:gap-0">
                          <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-secondary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-secondary">
                            <span>Upload a new file</span>
                            <input
                              id="image"
                              name="image"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="sm:pl-1 hidden sm:inline">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    {formData.image && (
                      <p className="mt-2 text-xs sm:text-sm text-gray-600 truncate">
                        New file selected: {formData.image.name}
                      </p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Product is active
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-3 sm:pt-4">
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
                    {submitting ? 'Updating...' : 'Update Product'}
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

export default EditProductPage;

