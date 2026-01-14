'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import ApiSwitcher from '@/components/admin/ApiSwitcher';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders, handleTokenExpiration } from '@/utils/apiHelpers';
import {
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  CurrencyDollarIcon,
  PencilIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: {
    id: number;
    name: string;
  };
  is_active: boolean;
  is_approved: boolean;
  image?: string;
  images?: Array<{ id: number; image: string; order: number }>;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Also try fetching with auth if token is available
    if (token) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    // Refetch products when token becomes available
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const apiUrl = getApiUrl();
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/api/products/`),
        fetch(`${apiUrl}/api/categories/`),
      ]);

      const productsData = await productsRes.json();
      const categories = await categoriesRes.json();

      // Extract products list from response
      let productsList = [];
      if (Array.isArray(productsData)) {
        productsList = productsData;
      } else if (productsData.results && Array.isArray(productsData.results)) {
        productsList = productsData.results;
      }

      // Set products if we got them
      if (productsList.length > 0) {
        const sortedProducts = [...productsList].sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setProducts(sortedProducts);
        setLoadingProducts(false);
      }

      setStats({
        totalProducts: productsData.count || productsData.length || productsList.length || 0,
        totalCategories: categories.count || categories.length || 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
      });
    } catch (error) {
      // Error handled silently - stats will remain at default values
      setLoadingProducts(false);
    }
  };

  const fetchProducts = async () => {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      setLoadingProducts(false);
      return;
    }

    try {
      // Try with auth first, fallback to without auth if token not available
      const headers = token ? getApiHeaders(token) as Record<string, string> : {};
      const response = await fetch(`${apiUrl}/api/products/`, {
        method: 'GET',
        headers: headers,
      });

      if (token && handleTokenExpiration(response)) {
        setLoadingProducts(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Handle both paginated and non-paginated responses
        let productsList = [];
        if (Array.isArray(data)) {
          productsList = data;
        } else if (data.results && Array.isArray(data.results)) {
          productsList = data.results;
        } else if (data.count !== undefined) {
          productsList = data.results || [];
        }
        
        const sortedProducts = productsList.length > 0
          ? [...productsList].sort((a, b) => 
              new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            )
          : [];
        setProducts(sortedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleApprove = async (productId: number) => {
    const apiUrl = getApiUrl();
    if (!apiUrl || !token) {
      toast.error('Authentication required');
      return;
    }

    setApproving(productId);
    const approveToast = toast.loading('Approving product...');

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/products/${productId}/approve/`, {
        method: 'POST',
        headers: headers,
      });

      if (handleTokenExpiration(response)) {
        toast.dismiss(approveToast);
        setApproving(null);
        return;
      }

      if (response.ok) {
        toast.success('Product approved successfully!', { id: approveToast });
        setProducts(products.map(p => 
          p.id === productId ? { ...p, is_approved: true } : p
        ));
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to approve product', { id: approveToast });
      }
    } catch (error) {
      toast.error('Network error. Please try again.', { id: approveToast });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (productId: number) => {
    const apiUrl = getApiUrl();
    if (!apiUrl || !token) {
      toast.error('Authentication required');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to reject this product? It will no longer be visible to clients.');
    if (!confirmed) return;

    setApproving(productId);
    const rejectToast = toast.loading('Rejecting product...');

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/products/${productId}/reject/`, {
        method: 'POST',
        headers: headers,
      });

      if (handleTokenExpiration(response)) {
        toast.dismiss(rejectToast);
        setApproving(null);
        return;
      }

      if (response.ok) {
        toast.success('Product rejected', { id: rejectToast });
        setProducts(products.map(p => 
          p.id === productId ? { ...p, is_approved: false } : p
        ));
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to reject product', { id: rejectToast });
      }
    } catch (error) {
      toast.error('Network error. Please try again.', { id: rejectToast });
    } finally {
      setApproving(null);
    }
  };

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: CubeIcon,
      bgColor: 'var(--color-primary)', // Primary
      textColor: '#ffffff',
    },
    {
      name: 'Categories',
      value: stats.totalCategories,
      icon: TagIcon,
      bgColor: 'var(--color-success)', // Success (Emerald)
      textColor: '#ffffff',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      bgColor: 'var(--color-warning)', // Warning (Amber)
      textColor: '#ffffff',
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      bgColor: 'var(--color-secondary)', // Secondary (Brown)
      textColor: '#ffffff',
    },
    {
      name: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      bgColor: 'var(--color-accent)', // Accent (Light Gray)
      textColor: '#ffffff',
    },
  ];

  return (
    <ProtectedRoute requiredRole="staff">
      <AdminLayout>
            <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Dashboard</h1>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--color-accent)' }}>
              Overview of your furniture store
            </p>
          </div>

          {/* API Switcher */}
          <ApiSwitcher />

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg" style={{ border: '1px solid var(--color-accent)' }}>
                <div className="p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-2 sm:p-3 rounded-md" style={{ backgroundColor: stat.bgColor }}>
                        <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: stat.textColor }} />
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-5 w-0 flex-1 min-w-0">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--color-accent)' }}>
                          {stat.name}
                        </dt>
                        <dd className="text-base sm:text-lg font-medium truncate" style={{ color: 'var(--color-primary)' }}>
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Products Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-accent)' }}>
            <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6 border-b" style={{ borderColor: 'var(--color-accent)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-medium" style={{ color: 'var(--color-primary)' }}>
                  All Products ({products.length})
                </h3>
                <button
                  onClick={() => router.push('/admin/products')}
                  className="text-xs sm:text-sm font-medium hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Manage Products
                </button>
              </div>
            </div>
            
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-secondary)' }}></div>
              </div>
            ) : products.length === 0 ? (
              <div className="px-3 py-8 sm:px-4 sm:py-12 text-center">
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-accent)' }}>No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                        Product
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                        Category
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                        Price
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                        Stock
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                        Approval
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => {
                      const firstImage = product.images && product.images.length > 0 
                        ? product.images[0].image 
                        : product.image;
                      const imageUrl = firstImage 
                        ? (firstImage.startsWith('http') ? firstImage : `${getApiUrl()}${firstImage}`)
                        : null;

                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="h-10 w-10 rounded object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                    <CubeIcon className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm" style={{ color: 'var(--color-accent)' }}>
                              {product.category?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                              ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm" style={{ color: 'var(--color-accent)' }}>
                              {product.stock}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.is_approved 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {product.is_approved ? 'Approved' : 'Pending'}
                              </span>
                              {!product.is_approved && (
                                <button
                                  onClick={() => handleApprove(product.id)}
                                  disabled={approving === product.id}
                                  className="px-2 py-1 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: 'var(--color-success)' }}
                                  title="Approve product"
                                >
                                  {approving === product.id ? 'Approving...' : 'Approve'}
                                </button>
                              )}
                              {product.is_approved && (
                                <button
                                  onClick={() => handleReject(product.id)}
                                  disabled={approving === product.id}
                                  className="px-2 py-1 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: 'var(--color-warning)' }}
                                  title="Reject product"
                                >
                                  {approving === product.id ? 'Rejecting...' : 'Reject'}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Edit product"
                              >
                                <PencilIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/products`)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="View product"
                              >
                                <EyeIcon className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
