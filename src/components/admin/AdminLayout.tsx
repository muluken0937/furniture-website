'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, isStaff, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
              Access Denied
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-accent)' }}>
              Please log in to access the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
              Access Denied
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-accent)' }}>
              You don't have permission to access the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Fixed Sidebar - Starts from bottom of header */}
      <div 
        className="fixed left-0" 
        style={{ 
          top: '112px', // Start from bottom of header
          zIndex: 59 // High z-index to ensure visibility
        }}
      >
        <AdminSidebar />
      </div>
      
      {/* Fixed Admin Panel Banner - From right edge of sidebar to right edge of screen */}
      <div 
        className="fixed text-white py-3" 
        style={{ 
          backgroundColor: 'var(--color-primary)',
          top: '112px', // Position below the main header
          left: '256px', // Start from right edge of sidebar
          right: '0px', // Extend to right edge of screen
          zIndex: 60 // Higher than header's z-50
        }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-white hover:bg-opacity-20"
            style={{ 
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content with proper margins */}
      <main 
        className="p-6" 
        style={{ 
          marginLeft: '256px', // Width of sidebar
          marginTop: '160px', // Height of header (112px) + admin panel banner (48px)
          minHeight: 'calc(100vh - 160px)',
          position: 'relative',
          zIndex: 1 // Lower z-index than fixed elements
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
