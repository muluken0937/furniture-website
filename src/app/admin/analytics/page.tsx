'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders } from '@/utils/apiHelpers';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  TagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AnalyticsData {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  recentOrders: any[];
  topProducts: any[];
  categoryDistribution: { name: string; count: number }[];
}

const AnalyticsPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    recentOrders: [],
    topProducts: [],
    categoryDistribution: [],
  });

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    if (!apiUrl) {
      toast.error('API URL is not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      
      // Fetch all data in parallel
      const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/api/products/`, { headers }),
        fetch(`${apiUrl}/api/categories/`, { headers }),
        fetch(`${apiUrl}/api/orders/`, { headers }).catch(() => null),
        fetch(`${apiUrl}/api/users/`, { headers }).catch(() => null),
      ]);

      const products = await productsRes.json();
      const categories = await categoriesRes.json();
      const orders = ordersRes?.ok ? await ordersRes.json() : { results: [], count: 0 };
      const users = usersRes?.ok ? await usersRes.json() : { results: [], count: 0 };

      // Calculate revenue from orders
      const revenue = orders.results?.reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.total || order.cart?.subtotal || 0));
      }, 0) || 0;

      // Get category distribution
      const categoryDistribution = categories.results || categories;
      const categoryCounts = categoryDistribution.map((cat: any) => ({
        name: cat.name,
        count: products.results?.filter((p: any) => p.category === cat.id || p.category?.id === cat.id).length || 0,
      }));

      // Get top products (by stock or price - simplified)
      const topProducts = (products.results || products).slice(0, 5).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
      }));

      setAnalytics({
        totalProducts: products.count || products.length || 0,
        totalCategories: categories.count || categories.length || 0,
        totalOrders: orders.count || orders.results?.length || 0,
        totalUsers: users.count || users.results?.length || 0,
        totalRevenue: revenue,
        revenueChange: 0, // Would need historical data
        ordersChange: 0, // Would need historical data
        productsChange: 0, // Would need historical data
        recentOrders: orders.results?.slice(0, 5) || [],
        topProducts,
        categoryDistribution: categoryCounts,
      });
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  const statCards = [
    {
      name: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CurrencyDollarIcon,
      bgColor: 'var(--color-primary)',
      change: analytics.revenueChange,
      changeLabel: 'vs last month',
    },
    {
      name: 'Total Orders',
      value: analytics.totalOrders,
      icon: ShoppingCartIcon,
      bgColor: 'var(--color-warning)',
      change: analytics.ordersChange,
      changeLabel: 'vs last month',
    },
    {
      name: 'Total Products',
      value: analytics.totalProducts,
      icon: CubeIcon,
      bgColor: 'var(--color-success)',
      change: analytics.productsChange,
      changeLabel: 'vs last month',
    },
    {
      name: 'Total Users',
      value: analytics.totalUsers,
      icon: UsersIcon,
      bgColor: 'var(--color-secondary)',
      change: 0,
      changeLabel: 'registered',
    },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3" style={{ color: 'var(--color-primary)' }} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Comprehensive insights into your store performance</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    {stat.change !== 0 && (
                      <div className="flex items-center mt-2">
                        {stat.change > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(stat.change)}% {stat.changeLabel}
                        </span>
                      </div>
                    )}
                    {stat.change === 0 && stat.changeLabel && (
                      <p className="text-xs text-gray-500 mt-2">{stat.changeLabel}</p>
                    )}
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: stat.bgColor }}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Data Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h2>
              <div className="space-y-3">
                {analytics.categoryDistribution.length > 0 ? (
                  analytics.categoryDistribution.map((cat, index) => {
                    const total = analytics.categoryDistribution.reduce((sum, c) => sum + c.count, 0);
                    const percentage = total > 0 ? (cat.count / total) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                          <span className="text-sm text-gray-600">{cat.count} products</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: 'var(--color-primary)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No category data available</p>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
              <div className="space-y-3">
                {analytics.topProducts.length > 0 ? (
                  analytics.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3" style={{ backgroundColor: 'var(--color-primary)' }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${product.price}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No products available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          {analytics.recentOrders.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.recentOrders.map((order: any) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(order.total || order.cart?.subtotal || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <TagIcon className="w-6 h-6 text-gray-600 mb-2" />
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalCategories}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <CubeIcon className="w-6 h-6 text-gray-600 mb-2" />
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <UsersIcon className="w-6 h-6 text-gray-600 mb-2" />
                <p className="text-sm text-gray-600">Registered Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;

