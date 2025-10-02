'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
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
    <div 
      className="w-64 bg-white shadow-lg overflow-y-auto" 
      style={{ 
        borderRight: '1px solid #94a3b8',
        borderTop: '2px solid #0f766e', // Add top border to differentiate from header
        height: 'calc(100vh - 112px)', // Full height minus header height
        position: 'relative',
        zIndex: 59 // High z-index to ensure visibility
      }}
    >
      <div className="flex flex-col h-full">
        {/* Profile Section - At top of sidebar */}
        <div 
          className="p-4" 
          style={{ 
            borderBottom: '1px solid #94a3b8',
            backgroundColor: '#f8fafc'
          }}
        >
          <div className="flex items-center space-x-3">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: '#0f766e' }}
              >
                <UserIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#0f766e' }}>
                {isAdmin ? 'Administrator' : 'Staff Member'}
              </p>
              <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
                admin@furnicraft.com
              </p>
            </div>
          </div>
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
                    ? 'text-white'
                    : 'text-gray-600 hover:text-white'
                }`}
                style={isActive ? { backgroundColor: '#0f766e' } : {}}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#a16207'; // Secondary color for hover
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info - Fixed at bottom */}
        <div 
          className="p-4" 
          style={{ 
            borderTop: '1px solid #94a3b8',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white'
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d97706' }}>
                <span className="text-sm font-medium text-white">
                  {isAdmin ? 'A' : 'S'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium" style={{ color: '#0f766e' }}>
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
