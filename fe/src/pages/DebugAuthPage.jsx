import React, { useEffect, useState, useCallback } from 'react';
import { urls } from '../services/api';

export default function DebugAuthPage() {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = urls.getBackendUrl();

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/auth/status`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAuthStatus(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleGoogleLogin = () => {
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
          Authentication Debug
        </h1>

        {error ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Workspace Auth Status</h2>

          {authStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {authStatus.authenticated ? 'OK' : 'NO'}
                </span>
                <div>
                  <p className="font-semibold">
                    {authStatus.authenticated ? 'Authenticated' : 'Not authenticated'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {authStatus.authenticated
                      ? `Provider: ${authStatus.authProvider || '-'}`
                      : 'Sign in with email/password or Google first'}
                  </p>
                </div>
              </div>

              {authStatus.authenticated ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-mono text-sm">{authStatus.user?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{authStatus.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{authStatus.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Verified:</span>
                    <span className={authStatus.emailVerified ? 'text-green-600' : 'text-red-600'}>
                      {authStatus.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Has Google Token:</span>
                    <span className={authStatus.hasGoogleToken ? 'text-green-600' : 'text-amber-600'}>
                      {authStatus.hasGoogleToken ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-600">No authentication data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>

          <div className="space-y-3">
            {!authStatus?.authenticated ? (
              <button
                onClick={handleGoogleLogin}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login with Google
              </button>
            ) : null}

            <button
              onClick={checkAuthStatus}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Refresh Status
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Backend URL:</strong> {backendUrl}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Auth Endpoint:</strong> {backendUrl}/api/auth/status
          </p>
        </div>
      </div>
    </div>
  );
}
