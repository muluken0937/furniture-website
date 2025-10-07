'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import ApiSwitcher from '@/components/admin/ApiSwitcher';
import { getApiUrl } from '@/config/api';
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
  // loading state not required for this dashboard; remove unused variable

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
            <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-accent)' }}>
              Overview of your furniture store
            </p>
          </div>

          {/* API Switcher */}
          <ApiSwitcher />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg" style={{ border: '1px solid var(--color-accent)' }}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-md" style={{ backgroundColor: stat.bgColor }}>
                        <stat.icon className="w-6 h-6" style={{ color: stat.textColor }} />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium truncate" style={{ color: 'var(--color-accent)' }}>
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-medium" style={{ color: 'var(--color-primary)' }}>
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
              <h3 className="text-lg leading-6 font-medium" style={{ color: 'var(--color-primary)' }}>
                Quick Actions
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                >
                  Add Product
                </button>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-success)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-success)'}
                >
                  Add Category
                </button>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-warning)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-warning)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-warning)'}
                >
                  View Orders
                </button>
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
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
