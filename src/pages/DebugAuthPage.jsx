import React, { useEffect, useState, useCallback } from 'react';
import { urls } from '../services/api';

/**
 * Debug page to check authentication status
 */
export default function DebugAuthPage() {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = urls.getBackendUrl();

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/auth/google/status`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAuthStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLogin = () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔐 Authentication Debug
        </h1>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          {authStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {authStatus.connected ? '✅' : '❌'}
                </span>
                <div>
                  <p className="font-semibold">
                    {authStatus.connected ? 'Connected' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {authStatus.connected 
                      ? 'You are authenticated with Google' 
                      : 'You need to login with Google'}
                  </p>
                </div>
              </div>

              {authStatus.connected && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-mono text-sm">{authStatus.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{authStatus.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{authStatus.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Has Google Token:</span>
                    <span className={authStatus.hasGoogleToken ? 'text-green-600' : 'text-red-600'}>
                      {authStatus.hasGoogleToken ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No authentication data available</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          
          <div className="space-y-3">
            {!authStatus?.connected && (
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔐 Login with Google
              </button>
            )}

            <button
              onClick={checkAuthStatus}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              🔄 Refresh Status
            </button>

            {authStatus?.connected && (
              <a
                href="/workspace/email"
                className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
              >
                📧 Go to Email Page
              </a>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            📚 Instructions
          </h2>
          
          <div className="space-y-3 text-blue-800">
            <div>
              <p className="font-semibold">1. Login Required</p>
              <p className="text-sm">You must login with Google to access email features.</p>
            </div>

            <div>
              <p className="font-semibold">2. Accept Permissions</p>
              <p className="text-sm">Make sure to accept ALL permissions including Gmail access.</p>
            </div>

            <div>
              <p className="font-semibold">3. Check Status</p>
              <p className="text-sm">After login, verify that &quot;Has Google Token&quot; shows ✅ Yes.</p>
            </div>

            <div>
              <p className="font-semibold">4. Access Email</p>
              <p className="text-sm">Once authenticated, you can access the Email page.</p>
            </div>
          </div>
        </div>

        {/* Backend Info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Backend URL:</strong> {backendUrl}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Auth Endpoint:</strong> {backendUrl}/api/auth/google/status
          </p>
        </div>
      </div>
    </div>
  );
}
