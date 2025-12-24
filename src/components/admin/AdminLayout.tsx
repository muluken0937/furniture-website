'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, isStaff, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar - Starts from bottom of header */}
      <div 
        className={`fixed left-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ 
          top: '112px', // Start from bottom of header
          zIndex: 60 // High z-index to ensure visibility
        }}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Fixed Admin Panel Banner - From right edge of sidebar to right edge of screen */}
      <div 
        className="fixed text-white py-2 lg:py-3 lg:left-64" 
        style={{ 
          backgroundColor: 'var(--color-primary)',
          top: '112px', // Position below the main header
          right: '0px', // Extend to right edge of screen
          zIndex: 55 // Higher than header's z-50
        }}
      >
        <div className="container mx-auto px-3 lg:px-4 flex justify-between items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          <h2 className="text-base lg:text-lg font-semibold">Admin Panel</h2>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg transition-colors hover:bg-white hover:bg-opacity-20"
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
            <span className="text-xs lg:text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content with proper margins */}
      <main 
        className="p-3 sm:p-4 lg:p-6 lg:ml-64" 
        style={{ 
          marginTop: 'calc(112px - 60px)', // Height of header + admin panel banner
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
