'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAdmin, isStaff } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon, roles: ['admin', 'staff'] },
    { name: 'Products', href: '/admin/products', icon: CubeIcon, roles: ['admin', 'staff'] },
    { name: 'Categories', href: '/admin/categories', icon: TagIcon, roles: ['admin', 'staff'] },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon, roles: ['admin', 'staff'] },
    { name: 'Users', href: '/admin/users', icon: UsersIcon, roles: ['admin'] },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, roles: ['admin'] },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (isAdmin) return true;
    return item.roles.includes('staff');
  });

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {isAdmin ? 'A' : 'S'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {isAdmin ? 'Administrator' : 'Staff Member'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
