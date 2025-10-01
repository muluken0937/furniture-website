'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl, getApiName, checkApiHealth } from '../../../config/api';

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
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">API Configuration</h3>
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm text-gray-600">Current: {apiName}</p>
              <p className="text-xs text-gray-500 font-mono">{currentApi}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : isHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-gray-600">
                {isHealthy === null ? 'Checking...' : isHealthy ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">API Environment</h4>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-sm font-medium text-gray-900 mb-1">{apiName}</div>
              <div className="text-xs text-gray-500 font-mono">{currentApi}</div>
              <button
                onClick={handleRefresh}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Refresh Status
              </button>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <p>API URL is configured via environment variables (NEXT_PUBLIC_API_URL).</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiSwitcher;
