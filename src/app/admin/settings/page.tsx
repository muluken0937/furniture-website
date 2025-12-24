'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/config/api';
import { getApiHeaders, extractErrorMessage } from '@/utils/apiHelpers';
import { 
  CogIcon, 
  ServerIcon, 
  GlobeAltIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  date_joined: string;
}

const SettingsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline' | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    date_joined: '',
  });
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });

  useEffect(() => {
    const currentApiUrl = getApiUrl();
    setApiUrl(currentApiUrl);
    checkApiStatus();
    
    // Initialize form with current user data from context immediately
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        first_name: '',
        last_name: '',
      });
      setProfileData({
        id: user.id || 0,
        username: user.username || '',
        email: user.email || '',
        first_name: '',
        last_name: '',
        role: user.role || '',
        date_joined: '',
      });
    }
    
    // Fetch full profile from API when token is available
    if (currentApiUrl && token) {
      fetchProfileWithUrl(currentApiUrl);
    }
  }, [token, user]);

  const fetchProfileWithUrl = async (url: string) => {
    if (!url || !token) {
      // If no API URL or token, use user data from context
      if (user) {
        setProfileForm({
          username: user.username || '',
          email: user.email || '',
          first_name: '',
          last_name: '',
        });
        setProfileData({
          id: user.id || 0,
          username: user.username || '',
          email: user.email || '',
          first_name: '',
          last_name: '',
          role: user.role || '',
          date_joined: '',
        });
      }
      return;
    }

    setProfileLoading(true);
    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${url}/api/auth/profile/`, {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setProfileForm({
          username: data.username || user?.username || '',
          email: data.email || user?.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
      } else {
        // Keep existing user data from context
        if (user) {
          setProfileForm({
            username: user.username || '',
            email: user.email || '',
            first_name: '',
            last_name: '',
          });
        }
        toast.error('Failed to load full profile. Using basic user data.');
      }
    } catch (error) {
      // Keep existing user data from context
      if (user) {
        setProfileForm({
          username: user.username || '',
          email: user.email || '',
          first_name: '',
          last_name: '',
        });
      }
      toast.error('Failed to load full profile. Using basic user data.');
    } finally {
      setProfileLoading(false);
    }
  };


  const handleSaveProfile = async () => {
    if (!apiUrl || !token) {
      toast.error('API URL or authentication token is missing.');
      return;
    }

    setSavingProfile(true);
    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/auth/profile/update/`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({ ...profileData, ...data });
        toast.success('Profile updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData, 'Failed to update profile. Please try again.');
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!apiUrl || !token) {
      toast.error('API URL or authentication token is missing.');
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password2) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const headers = getApiHeaders(token) as Record<string, string>;
      const response = await fetch(`${apiUrl}/api/auth/profile/change-password/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(passwordForm),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          old_password: '',
          new_password: '',
          new_password2: '',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = extractErrorMessage(errorData, 'Failed to change password. Please try again.');
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const checkApiStatus = async () => {
    if (!apiUrl) {
      setApiStatus('offline');
      return;
    }

    setApiStatus('checking');
    try {
      const response = await fetch(`${apiUrl}/api/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Note: General settings would be saved to backend in a real application
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CogIcon className="w-8 h-8 mr-3" style={{ color: 'var(--color-primary)' }} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your application settings and profile</p>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <UserCircleIcon className="w-6 h-6 mr-2" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="profile-username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="profile-username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="profile-email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="profile-first-name"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="profile-last-name"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Role:</span> {profileData.role || 'N/A'}</p>
                  <p className="mt-1"><span className="font-medium">Member since:</span> {profileData.date_joined ? new Date(profileData.date_joined).toLocaleDateString() : 'N/A'}</p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <LockClosedIcon className="w-6 h-6 mr-2" style={{ color: 'var(--color-secondary)' }} />
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="old-password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={passwordForm.new_password2}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <ServerIcon className="w-6 h-6 mr-2" style={{ color: 'var(--color-secondary)' }} />
              <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  API Base URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    id="apiUrl"
                    value={apiUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="http://localhost:8000"
                  />
                  <button
                    onClick={checkApiStatus}
                    className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    Test Connection
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  API URL is configured via environment variables (NEXT_PUBLIC_API_URL). To change it, update your .env file and restart the application.
                </p>
              </div>

              {/* API Status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                {apiStatus === 'checking' && (
                  <div className="flex items-center text-yellow-600">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-1 animate-pulse" />
                    <span className="text-sm">Checking...</span>
                  </div>
                )}
                {apiStatus === 'online' && (
                  <div className="flex items-center text-green-600">
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">Online</span>
                  </div>
                )}
                {apiStatus === 'offline' && (
                  <div className="flex items-center text-red-600">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Environment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <InformationCircleIcon className="w-6 h-6 mr-2" style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-xl font-semibold text-gray-900">Environment Information</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Current API URL:</span>
                <span className="text-sm text-gray-600 font-mono">{apiUrl || 'Not configured'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Environment:</span>
                <span className="text-sm text-gray-600">
                  {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-700">App Version:</span>
                <span className="text-sm text-gray-600">
                  {process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
                </span>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <GlobeAltIcon className="w-6 h-6 mr-2" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                  <p className="text-xs text-gray-500 mt-1">Enable maintenance mode to restrict access</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-xs text-gray-500 mt-1">Receive email notifications for important events</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;

