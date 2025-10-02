'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button className="p-2 text-gray-400 hover:text-gray-500 lg:hidden">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h2 className="ml-4 text-lg font-semibold text-gray-900">
            Furniture Store Admin
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <BellIcon className="w-6 h-6" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <UserCircleIcon className="w-8 h-8" />
              <div className="hidden md:block">
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
