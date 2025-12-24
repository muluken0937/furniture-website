/**
 * API Helper Utilities
 * Shared functions for making API requests
 */

export interface ApiHeaders {
  'Content-Type'?: string;
  'Authorization'?: string;
}

/**
 * Check if response indicates token expiration (401 Unauthorized)
 * and trigger logout if needed
 */
export const handleTokenExpiration = (response: Response): boolean => {
  if (response.status === 401) {
    // Token expired or invalid
    if (typeof window !== 'undefined') {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refresh');
      
      // Redirect to login
      window.location.href = '/admin/login';
    }
    return true;
  }
  return false;
};

/**
 * Get API headers with optional authentication token
 * If token is not provided, tries to get it from localStorage
 */
export const getApiHeaders = (token?: string | null, includeContentType = true): ApiHeaders => {
  const headers: ApiHeaders = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Get token from parameter or localStorage
  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('token');
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

/**
 * Parse API response data (handles paginated and non-paginated responses)
 */
export const parseApiResponse = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
};

/**
 * Extract error message from API error response
 */
export const extractErrorMessage = (errorData: any, defaultMessage = 'An error occurred'): string => {
  if (errorData.name && Array.isArray(errorData.name)) {
    return errorData.name[0];
  }
  if (errorData.name) {
    return errorData.name;
  }
  if (errorData.detail) {
    return errorData.detail;
  }
  if (errorData.message) {
    return errorData.message;
  }
  return defaultMessage;
};

/**
 * Validate category name
 */
export const validateCategoryName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Category name is required';
  }
  if (trimmed.length < 2) {
    return 'Category name must be at least 2 characters long';
  }
  return null;
};

