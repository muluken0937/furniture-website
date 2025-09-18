'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'staff' | 'customer';
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'staff',
  fallbackPath = '/admin/login'
}) => {
  const { isAuthenticated, isAdmin, isStaff, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      if (requiredRole === 'admin' && !isAdmin) {
        router.push('/admin/login');
        return;
      }

      if (requiredRole === 'staff' && !isStaff) {
        router.push('/admin/login');
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isStaff, loading, requiredRole, router, fallbackPath]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return null; // Will redirect
  }

  if (requiredRole === 'staff' && !isStaff) {
    return null; // Will redirect
  }

  return <>{children}</>;
};

export default ProtectedRoute;
