'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { UserIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  is_active: boolean;
  date_joined: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // apiUrl is intentionally unused in this placeholder implementation
  void getApiUrl;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Note: This would need a users endpoint in your backend
      // For now, we'll show a placeholder
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@furniture.com',
          role: 'admin',
          is_active: true,
          date_joined: '2024-01-01',
        },
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">Manage user accounts and roles</p>
            </div>
            <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Add User
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id}>
                  <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-start sm:items-center w-full sm:w-auto min-w-0">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                            {user.username}
                          </h3>
                          <span className={`sm:ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                          <span className={`sm:ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">{user.email}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Joined: {new Date(user.date_joined).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button className="p-2 text-gray-400 hover:text-blue-600" title="Edit user">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600" title="Delete user">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Get started by creating a new user.
              </p>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default UsersPage;
