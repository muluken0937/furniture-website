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
    const selectedApi = apis[apiKey];
    if (selectedApi) {
      setCurrentApi(selectedApi.url);
      setApiName(selectedApi.name);
      // In a real app, you'd need to restart the app or use a global state manager
      // For now, we'll just show the selection
      console.log(`API switched to: ${selectedApi.name} (${selectedApi.url})`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">API Configuration</h3>
          <p className="text-sm text-gray-500">
            Current: {apiName}
          </p>
          <p className="text-xs text-gray-400 font-mono">
            {currentApi}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Health Status */}
          <div className="flex items-center">
            {isHealthy === null ? (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            ) : isHealthy ? (
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            ) : (
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            )}
            <span className="ml-1 text-xs text-gray-500">
              {isHealthy === null ? 'Checking...' : isHealthy ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Available APIs:</h4>
          <div className="space-y-2">
            {Object.entries(apis).map(([key, api]) => (
              <div
                key={key}
                className={`p-2 rounded border cursor-pointer transition-colors ${
                  currentApi === api.url
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleApiChange(key)}
              >
                <div className="text-sm font-medium text-gray-900">{api.name}</div>
                <div className="text-xs text-gray-500 font-mono">{api.url}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Note: API switching requires app restart in production.</p>
            <p>Current environment: {process.env.NODE_ENV}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiSwitcher;
