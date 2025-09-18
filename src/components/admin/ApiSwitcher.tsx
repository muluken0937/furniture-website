'use client';

import React, { useState, useEffect } from 'react';
import { getApiUrl, getApiName, getAllApis, checkApiHealth } from '../../../config/api';

const ApiSwitcher: React.FC = () => {
  const [currentApi, setCurrentApi] = useState(getApiUrl());
  const [apiName, setApiName] = useState(getApiName());
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const apis = getAllApis();

  useEffect(() => {
    checkApiHealth().then(setIsHealthy);
  }, [currentApi]);

  const handleApiChange = (apiKey: string) => {
    const selectedApi = apis[apiKey as keyof typeof apis];
    if (selectedApi) {
      setCurrentApi(selectedApi.url);
      setApiName(selectedApi.name);
      // In a real app, you'd need to restart the app or use a global state manager
      // For now, we'll just show the selection
      console.log(`API switched to: ${selectedApi.name} (${selectedApi.url})`);
    }
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
          <h4 className="text-sm font-medium text-gray-900 mb-3">Switch API Environment</h4>
          <div className="space-y-2">
            {Object.entries(apis).map(([key, api]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="api"
                  value={key}
                  checked={currentApi === api.url}
                  onChange={() => handleApiChange(key)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{api.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{api.url}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <p>Note: API switching requires a page refresh to take effect.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiSwitcher;
