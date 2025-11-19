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

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

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

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div 
      className="w-64 bg-white shadow-lg overflow-y-auto lg:block" 
        style={{ 
        borderRight: '1px solid var(--color-accent)',
        borderTop: '2px solid var(--color-primary)', // Add top border to differentiate from header
        height: 'calc(100vh - 112px)', // Full height minus header height
        position: 'relative',
        zIndex: 60 // High z-index to ensure visibility
      }}
    >
      <div className="flex flex-col h-full">
        {/* Profile Section - At top of sidebar */}
        <div 
          className="p-3 sm:p-4" 
            style={{ 
            borderBottom: '1px solid var(--color-accent)',
            backgroundColor: '#f8fafc'
          }}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate text-primary-var">
                {isAdmin ? 'Administrator' : 'Staff Member'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-accent)' }}>
                admin@furnicraft.com
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-var font-bold'
                    : 'text-gray-600 font-medium hover:text-white'
                }`}
                style={isActive ? { backgroundColor: 'var(--color-warning)' } : {}}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-secondary)'; // Secondary color for hover
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon className="w-5 h-5 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info - Fixed at bottom */}
        <div 
          className="p-3 sm:p-4" 
          style={{ 
            borderTop: '1px solid #94a3b8',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white'
          }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d97706' }}>
                <span className="text-xs sm:text-sm font-medium text-white">
                  {isAdmin ? 'A' : 'S'}
                </span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium" style={{ color: '#0f766e' }}>
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
