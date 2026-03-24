import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function GoogleSheetsConnect() {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    email: null,
    name: null,
    picture: null
  });

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data } = await axios.get('/api/auth/google/status');
      setStatus({
        connected: data.connected,
        email: data.email,
        name: data.name,
        picture: data.picture,
        loading: false
      });
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus({ connected: false, loading: false, email: null, name: null, picture: null });
    }
  };

  const handleConnect = () => {
    // Open OAuth in popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      '/api/auth/google',
      'Google OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for popup close
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        checkConnectionStatus(); // Refresh status
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Google account?')) {
      return;
    }

    try {
      await axios.post('/api/auth/google/disconnect');
      setStatus({ connected: false, email: null, name: null, picture: null, loading: false });
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect. Please try again.');
    }
  };

  if (status.loading) {
    return (
      <div className="border rounded-lg p-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm15 0h3v3h-3v-3z" fill="#0F9D58"/>
              <path d="M18 18v3h3v-3h-3zm0-2h5v5h-5v-5z" fill="#0F9D58"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Google Sheets</h3>
            {status.connected ? (
              <div className="flex items-center gap-2">
                {status.picture && (
                  <img
                    src={status.picture}
                    alt={status.name}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <p className="text-sm text-green-600">
                  Connected as {status.email}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Not connected
              </p>
            )}
          </div>
        </div>

        {status.connected ? (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect Google Sheets
          </button>
        )}
      </div>

      {status.connected && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            Your Google Sheets are now accessible in workflows. You can disconnect anytime.
          </p>
        </div>
      )}
    </div>
  );
}
