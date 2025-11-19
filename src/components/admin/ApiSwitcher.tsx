'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl, getApiName, checkApiHealth } from '@/config/api';

const ApiSwitcher: React.FC = () => {
  const [currentApi, setCurrentApi] = useState(getApiUrl());
  const [apiName, setApiName] = useState(getApiName());
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkApiHealth(currentApi).then(setIsHealthy);
  }, [currentApi]);

  const handleRefresh = async () => {
    const url = getApiUrl();
    const name = getApiName();
    setCurrentApi(url);
    setApiName(name);
    const healthy = await checkApiHealth(url);
    setIsHealthy(healthy);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">API Configuration</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Current: {apiName}</p>
              <p className="text-xs text-gray-500 font-mono truncate">{currentApi}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isHealthy ? 'bg-green-500' : isHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-gray-600">
                {isHealthy === null ? 'Checking...' : isHealthy ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 underline self-start sm:self-auto"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">API Environment</h4>
          <div className="space-y-2">
            <div className="p-2 sm:p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1 truncate">{apiName}</div>
              <div className="text-xs text-gray-500 font-mono break-all">{currentApi}</div>
              <button
                onClick={handleRefresh}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Refresh Status
              </button>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xs text-gray-500">
            <p>API URL is configured via environment variables (NEXT_PUBLIC_API_URL).</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiSwitcher;
