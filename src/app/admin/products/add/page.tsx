'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders, extractErrorMessage } from '@/utils/apiHelpers';
import { ArrowLeftIcon, PhotoIcon, ChevronRightIcon, ChevronLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
  images: File[];
  material: string;
  style: string;
  color: string;
  finish: string;
  roomType: string;
}

const AddProductPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
    category: 0,
    is_active: true,
    images: [],
    material: '',
    style: '',
    color: '',
    finish: '',
    roomType: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const apiUrl = getApiUrl();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!apiUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/categories/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setCategories([]);
          return;
        }

        const data = await response.json();
        
        // Handle different response formats
        let categoriesList = [];
        if (Array.isArray(data)) {
          categoriesList = data;
        } else if (data.results && Array.isArray(data.results)) {
          categoriesList = data.results;
        } else if (data.results) {
          categoriesList = [data.results];
        }
        
        setCategories(categoriesList);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [apiUrl]);

  const validateStep1 = (): boolean => {
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    // Check if price is valid number and greater than 0
    if (isNaN(formData.price) || formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    // Check if stock is valid number and not negative
    if (isNaN(formData.stock) || formData.stock < 0) {
      errors.stock = 'Stock cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
      setCurrentStep(2);
      setFormErrors({});
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setFormErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // On step 1, just move to next step without submitting
    if (currentStep === 1) {
      if (validateStep1()) {
      nextStep();
      }
      return;
    }

    // Step 2 - validate before submitting
    if (!validateStep2()) {
      return;
    }

    // Warn if no images are selected (but allow submission)
    if (formData.images.length === 0) {
      toast('No images selected. Product will be created without images.', {
        icon: '⚠️',
        duration: 4000,
      });
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

    setSubmitting(true);
    
    const createToast = toast.loading('Creating product...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stock', formData.stock.toString());
      // SKU is auto-generated by the backend, so we don't send it
      formDataToSend.append('category', formData.category.toString());
      formDataToSend.append('is_active', formData.is_active.toString());
      
      // Add images if provided (up to 5)
      if (formData.images.length > 0) {
        formData.images.slice(0, 5).forEach((image) => {
          formDataToSend.append('images', image);
        });
      }

      // Get headers with Authorization but without Content-Type (FormData sets it automatically)
      const headers = getApiHeaders(token, false) as Record<string, string>;

      const response = await fetch(`${apiUrl}/api/products/`, {
        method: 'POST',
        headers: headers,
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Product created successfully!', { id: createToast });
        router.push('/admin/products');
      } else {
        // Try to parse error response
        let errorData: any = {};
        const contentType = response.headers.get('content-type');
        let responseText = '';
        
        try {
          // Read response text once
          responseText = await response.text();
          
          // Try to parse as JSON if content type suggests it
          if (contentType && contentType.includes('application/json')) {
            try {
              if (responseText && responseText.trim()) {
                errorData = JSON.parse(responseText);
              } else {
                errorData = { detail: `Server error: ${response.status} ${response.statusText}` };
              }
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
        
        // If errorData is empty but we have responseText, use it
        if (Object.keys(errorData).length === 0 && responseText) {
          // Check if it's HTML (Django error page)
          if (responseText.trim().startsWith('<')) {
            // Extract any useful text from HTML if possible
            const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
            const h1Match = responseText.match(/<h1[^>]*>(.*?)<\/h1>/i);
            const errorMatch = responseText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
            
            if (errorMatch) {
              errorData = { detail: `Server Error: ${errorMatch[1].substring(0, 200)}` };
            } else if (h1Match) {
              errorData = { detail: `Server Error: ${h1Match[1]}` };
            } else if (titleMatch) {
              errorData = { detail: `Server Error: ${titleMatch[1]}` };
            } else {
              errorData = { detail: `Server Error (${response.status}): The server returned an HTML error page. Check backend logs for details.` };
            }
          } else {
            // Not HTML, use the text directly
            errorData = { detail: responseText.substring(0, 500) };
          }
        }

        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          const errorMsg = 'Authentication failed. Please log in again.';
          setFormErrors({ _general: errorMsg });
          toast.error(errorMsg, { id: createToast });
        } else if (response.status === 404) {
          const errorMsg = 'Endpoint not found. Please check your API configuration.';
          setFormErrors({ _general: errorMsg });
          toast.error(errorMsg, { id: createToast });
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
              toast.error(firstError, { id: createToast });
            } else {
              setFormErrors({ _general: errorMessage });
              toast.error(errorMessage, { id: createToast });
            }
          } else {
            setFormErrors({ _general: errorMessage });
            toast.error(errorMessage, { id: createToast });
          }
        } else {
          // Other errors
          const errorMessage = extractErrorMessage(errorData, `Failed to create product (${response.status}). Please try again.`);
          setFormErrors({ _general: errorMessage });
          toast.error(errorMessage, { id: createToast });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setFormErrors({ _general: errorMessage });
      toast.error(errorMessage, { id: createToast });
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images total
    const currentCount = formData.images.length;
    const remainingSlots = 5 - currentCount;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.error(`You can only upload up to 5 images. ${files.length - remainingSlots} image(s) were not added.`);
    }

    // Add new files to form data
    const newImages = [...formData.images, ...filesToAdd];
    setFormData(prev => ({ ...prev, images: newImages }));
      
    // Create previews for new images
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result;
        if (typeof result === 'string') {
          setImagePreviews(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Add New Product</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                {currentStep === 1 
                  ? "Enter the basic product information" 
                  : "Add product image and finalize details"}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
            <div className="mb-4 px-2">
            <div className="flex items-center justify-center space-x-2 sm:space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-secondary-var' : 'text-accent'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  currentStep >= 1 ? 'bg-secondary-var text-white' : 'bg-accent/20 text-accent'
                }`}>
                  1
                </div>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline">Basic Info</span>
              </div>
              
              <div className={`w-4 sm:w-8 h-1 ${currentStep >= 2 ? 'bg-secondary-var' : 'bg-accent/20'}`}></div>
              
              <div className={`flex items-center ${currentStep >= 2 ? 'text-secondary-var' : 'text-accent'}`}>
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  currentStep >= 2 ? 'bg-secondary-var text-white' : 'bg-accent/20 text-accent'
                }`}>
                  2
                </div>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium hidden sm:inline">Image & Details</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg border border-accent/20 overflow-hidden">
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-b border-accent/30 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                {currentStep === 1 ? 'Basic Information' : 'Pricing & Settings'}
              </h2>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-white to-accent/5">
              <form 
                onSubmit={handleSubmit} 
                onKeyDown={(e) => {
                  // Prevent form submission on Enter key when on step 1
                  if (currentStep === 1 && e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    if (validateStep1()) {
                      nextStep();
                    }
                  }
                }}
                className="space-y-3 sm:space-y-4"
              >
                {/* General Error Display */}
                {formErrors._general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{formErrors._general}</p>
                  </div>
                )}
                {currentStep === 1 ? (
                  /* Step 1: Basic Information */
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

                    {/* Description */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const parts = [];
                            
                            // Add product name
                            if (formData.name.trim()) {
                              parts.push(`Product Name: ${formData.name}`);
                            }
                            
                            // Add category
                            const selectedCategory = categories.find(cat => cat.id === formData.category);
                            if (selectedCategory) {
                              parts.push(`Category: ${selectedCategory.name}`);
                            }
                            
                            // Add attributes
                            const attributes = [];
                            if (formData.material) attributes.push(`Material: ${formData.material}`);
                            if (formData.style) attributes.push(`Style: ${formData.style}`);
                            if (formData.color) attributes.push(`Color: ${formData.color}`);
                            if (formData.finish) attributes.push(`Finish: ${formData.finish}`);
                            if (formData.roomType) attributes.push(`Room Type: ${formData.roomType}`);
                            
                            if (attributes.length > 0) {
                              parts.push('Product Attributes:\n' + attributes.join('\n'));
                            }
                            
                            if (parts.length > 0) {
                              const textToAdd = formData.description.trim() 
                                ? '\n\n' + parts.join('\n')
                                : parts.join('\n');
                              setFormData(prev => ({
                                ...prev,
                                description: prev.description + textToAdd
                              }));
                            }
                          }}
                          disabled={!formData.name.trim() && !formData.category && !formData.material && !formData.style && !formData.color && !formData.finish && !formData.roomType}
                          className="text-xs px-3 py-1 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          style={{ backgroundColor: '#a16207' }}
                          title="Add product name, category, and attributes to description"
                        >
                          Add to Description
                        </button>
                      </div>
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
                  </div>
                ) : (
                  /* Step 2: Additional Details */
                  <div className="space-y-4">
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
                    </div>

                    {/* Product Images (up to 5) */}
                    <div>
                      <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                        Product Images (up to 5) {formData.images.length === 0 && <span className="text-red-500">*</span>}
                      </label>
                      {imagePreviews.length > 0 ? (
                        <div className="mt-2 space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Product preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove image"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formData.images.length} image(s) selected ({(formData.images.reduce((total, img) => total + img.size, 0) / 1024 / 1024).toFixed(2)} MB total)
                            {formData.images.length < 5 && (
                              <span className="ml-2 text-gray-500">({5 - formData.images.length} more can be added)</span>
                            )}
                          </div>
                          {formData.images.length < 5 && (
                            <label htmlFor="images" className="block">
                              <div className="flex justify-center px-3 sm:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4 border-2 border-gray-300 border-dashed rounded-md hover:border-accent transition-colors cursor-pointer">
                                <div className="space-y-1 text-center">
                                  <PhotoIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    <span className="font-medium text-secondary hover:text-secondary/80">Add more images</span>
                                  </div>
                                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                                </div>
                      <input
                                  id="images"
                                  name="images"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                  accept="image/*"
                                  multiple
                      />
                    </div>
                      </label>
                          )}
                        </div>
                      ) : (
                      <div className="mt-1 flex justify-center px-3 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-accent transition-colors">
                        <div className="space-y-1 text-center">
                          <PhotoIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                          <div className="flex flex-col sm:flex-row text-xs sm:text-sm text-gray-600 items-center gap-1 sm:gap-0">
                              <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-secondary hover:text-secondary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-secondary">
                                <span>Upload images</span>
                              <input
                                  id="images"
                                  name="images"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept="image/*"
                                  multiple
                              />
                            </label>
                            <p className="sm:pl-1 hidden sm:inline">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each (up to 5 images)</p>
                          </div>
                        </div>
                      )}
                      {formErrors.images && <p className="text-red-500 text-sm mt-1">{formErrors.images}</p>}
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
                )}

                {/* Form Actions */}
                <div className="flex justify-between pt-3 sm:pt-4 gap-2 sm:gap-0">
                  {currentStep === 1 ? (
                    <div></div>
                  ) : (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-3 sm:px-4 py-2 border border-accent/40 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors duration-200"
                    >
                      <ChevronLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                  )}
                  
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-4 sm:px-6 py-2 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-2 ml-1" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center px-4 sm:px-6 py-2 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] sm:min-w-[140px]"
                      style={{ backgroundColor: submitting ? '#6b4513' : '#a16207' }}
                    >
                      {submitting ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Creating...</span>
                          <span className="sm:hidden">Creating...</span>
                        </>
                      ) : (
                        <>
                        <span className="hidden sm:inline">Create Product</span>
                        <span className="sm:hidden">Create</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AddProductPage; 