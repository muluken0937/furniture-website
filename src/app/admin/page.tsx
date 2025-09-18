'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import ApiSwitcher from '../../components/admin/ApiSwitcher';
import { getApiUrl } from '../../../config/api';
import {
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const apiUrl = getApiUrl();
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/api/products/`),
        fetch(`${apiUrl}/api/categories/`),
      ]);

      const products = await productsRes.json();
      const categories = await categoriesRes.json();

      setStats({
        totalProducts: products.count || products.length || 0,
        totalCategories: categories.count || categories.length || 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: CubeIcon,
      bgColor: '#0f766e', // Primary
      textColor: '#ffffff',
    },
    {
      name: 'Categories',
      value: stats.totalCategories,
      icon: TagIcon,
      bgColor: '#059669', // Success (Emerald)
      textColor: '#ffffff',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      bgColor: '#d97706', // Warning (Amber)
      textColor: '#ffffff',
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      bgColor: '#a16207', // Secondary (Brown)
      textColor: '#ffffff',
    },
    {
      name: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      bgColor: '#94a3b8', // Accent (Light Gray)
      textColor: '#ffffff',
    },
  ];

  return (
    <ProtectedRoute requiredRole="staff">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0f766e' }}>Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
              Overview of your furniture store
            </p>
          </div>

          {/* API Switcher */}
          <ApiSwitcher />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg" style={{ border: '1px solid #94a3b8' }}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md" style={{ backgroundColor: stat.bgColor }}>
                        <stat.icon className="w-6 h-6" style={{ color: stat.textColor }} />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium truncate" style={{ color: '#94a3b8' }}>
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-medium" style={{ color: '#0f766e' }}>
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white shadow rounded-lg" style={{ border: '1px solid #94a3b8' }}>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium" style={{ color: '#0f766e' }}>
                Quick Actions
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: '#0f766e' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d5d56'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
                >
                  Add Product
                </button>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: '#059669' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                  Add Category
                </button>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: '#d97706' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b45309'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                >
                  View Orders
                </button>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: '#a16207' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8a5206'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a16207'}
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
