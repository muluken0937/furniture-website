// API Configuration
const API_CONFIG = {
  // Production API (deployed on Render)
  production: {
    url: 'https://furniture-backend-ikq3.onrender.com',
    name: 'Production API (Render)'
  },
  
  // Local development API
  development: {
    url: 'http://localhost:8000',
    name: 'Local Development API'
  },
  
  // Docker local API
  docker: {
    url: 'http://backend:8000',
    name: 'Docker Local API'
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  if (typeof window !== 'undefined') {
    // Client-side: check if we're in Docker or local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return process.env.NODE_ENV === 'production' ? 'production' : 'development';
    }
    return 'production';
  }
  // Server-side: use environment variable
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

// Get API URL based on environment
export const getApiUrl = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env].url;
};

// Get API name for display
export const getApiName = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env].name;
};

// Get all available APIs
export const getAllApis = () => API_CONFIG;

// Check if API is available
export const checkApiHealth = async (url = getApiUrl()) => {
  try {
    const response = await fetch(`${url}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default {
  getApiUrl,
  getApiName,
  getAllApis,
  checkApiHealth
};
