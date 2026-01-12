'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getApiHeaders, extractErrorMessage, handleTokenExpiration } from '@/utils/apiHelpers';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'staff' | 'customer';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

const UsersPage: React.FC = () => {
  const router = useRouter();
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'customer' as 'admin' | 'staff' | 'customer',
    is_active: true,
  });

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!apiUrl) {
      setError('API URL is not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/auth/management/users/`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        const allUsers = data.results || data;
        // Filter out the current user to show only other accounts
        const otherUsers = allUsers.filter((u: User) => u.id !== currentUser?.id);
        setUsers(otherUsers);
        setError(null);
      } else {
        // Handle token expiration
        if (handleTokenExpiration(response)) {
          return;
        }
        
        if (response.status === 401 || response.status === 403) {
          const errorMsg = 'Authentication failed. Please log in again.';
          setError(errorMsg);
          toast.error(errorMsg);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = extractErrorMessage(errorData, 'Failed to fetch users. Please try again.');
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      password2: '',
      role: 'customer',
      is_active: true,
    });
    setShowAddModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      password2: '',
      role: user.role,
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    if (!apiUrl || !token) {
      toast.error('API URL or authentication token is missing.');
      return;
    }

    const deleteToast = toast.loading('Deleting user...');

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/auth/management/users/${userId}/`, {
        method: 'DELETE',
        headers: headers,
      });

      // Handle token expiration
      if (handleTokenExpiration(response)) {
        toast.dismiss(deleteToast);
        return;
      }

      if (response.ok || response.status === 204) {
        toast.success('User deleted successfully!', { id: deleteToast });
        await fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData, 'Failed to delete user. Please try again.');
        toast.error(errorMessage, { id: deleteToast });
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.', { id: deleteToast });
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!apiUrl || !token) {
      toast.error('API URL or authentication token is missing.');
      return;
    }

    const updateToast = toast.loading(`${user.is_active ? 'Deactivating' : 'Activating'} user...`);

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/auth/management/users/${user.id}/`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
          is_active: !user.is_active,
        }),
      });

      if (response.ok) {
        toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully!`, { id: updateToast });
        await fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData, 'Failed to update user status. Please try again.');
        toast.error(errorMessage, { id: updateToast });
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.', { id: updateToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiUrl || !token) {
      toast.error('API URL or authentication token is missing.');
      return;
    }

    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match');
      return;
    }

    const submitToast = toast.loading(showEditModal ? 'Updating user...' : 'Creating user...');

    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      let response;

      if (showEditModal && selectedUser) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          is_active: formData.is_active,
        };

        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        response = await fetch(`${apiUrl}/api/auth/management/users/${selectedUser.id}/`, {
          method: 'PATCH',
          headers: headers,
          body: JSON.stringify(updateData),
        });
      } else {
        // Create new user - use register endpoint with admin context
        response = await fetch(`${apiUrl}/api/auth/register/`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            password2: formData.password2,
            role: formData.role,
          }),
        });
      }

      if (response.ok) {
        toast.success(showEditModal ? 'User updated successfully!' : 'User created successfully!', { id: submitToast });
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedUser(null);
        await fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData, `Failed to ${showEditModal ? 'update' : 'create'} user. Please try again.`);
        toast.error(errorMessage, { id: submitToast });
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.', { id: submitToast });
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-accent/20">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Users</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage user accounts and roles</p>
            </div>
            <button 
              onClick={handleAdd}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add User
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Users List */}
          {users.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id}>
                    <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:bg-gray-50 transition-colors duration-200">
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
                          {user.first_name || user.last_name ? (
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                            </p>
                          ) : null}
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Joined: {new Date(user.date_joined).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            user.is_active
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                          title={user.is_active ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-accent hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all duration-200"
                          title="Edit user"
                        >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-2 text-accent hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete user"
                        >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4 bg-white rounded-lg shadow-sm border border-accent/20">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Get started by creating a new user.
              </p>
            </div>
          )}

          {/* Add/Edit Modal */}
          {(showAddModal || showEditModal) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {showEditModal ? 'Edit User' : 'Add New User'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        id="username"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password {showEditModal ? '(leave blank to keep current)' : '*'}
                      </label>
                      <input
                        type="password"
                        id="password"
                        required={!showEditModal}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      />
                    </div>

                    {!showEditModal && (
                      <div>
                        <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          id="password2"
                          required
                          value={formData.password2}
                          onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        id="role"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' | 'customer' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {showEditModal && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                          Active
                        </label>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          setSelectedUser(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-secondary text-white rounded-md text-sm font-medium hover:bg-secondary/90"
                      >
                        {showEditModal ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default UsersPage;
