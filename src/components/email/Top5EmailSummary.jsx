import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle, Sparkles, RefreshCw, Mail, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { urls } from '../../services/api';

/**
 * Priority badge component
 */
const PriorityBadge = ({ priority }) => {
  const config = {
    high: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: AlertCircle,
      label: 'High Priority'
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: Clock,
      label: 'Medium Priority'
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle,
      label: 'Low Priority'
    }
  };

  const { bg, text, icon: Icon, label } = config[priority] || config.medium;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

/**
 * Get current user info from backend
 */
const getCurrentUser = async () => {
  try {
    const backendUrl = urls.getBackendUrl();
    const response = await axios.get(`${backendUrl}/api/auth/google/status`, {
      withCredentials: true
    });

    if (response.data.connected) {
      return {
        id: response.data.userId || response.data.email,
        name: response.data.name,
        email: response.data.email,
        picture: response.data.picture
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get Google access token from backend
 */
const getGoogleAccessToken = async () => {
  try {
    const backendUrl = urls.getBackendUrl();
    const response = await axios.get(`${backendUrl}/api/google/token`, {
      withCredentials: true,
      timeout: 8000
    });

    return response.data?.access_token || null;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
};

/**
 * Top5EmailSummary Component
 * Displays AI-powered summary of unread emails from n8n webhook
 * Summary is cached in localStorage to persist across page refreshes
 */
export default function Top5EmailSummary() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const STORAGE_KEY = 'email_summary_cache';

  /**
   * Load cached summary from localStorage
   */
  const loadCachedSummary = () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is less than 1 hour old
        const cacheAge = Date.now() - parsed.timestamp;
        const oneHour = 60 * 60 * 1000;
        
        if (cacheAge < oneHour) {
          console.log('Loading cached email summary');
          return parsed.data;
        } else {
          console.log('Cache expired, will fetch fresh data');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Error loading cached summary:', err);
    }
    return null;
  };

  /**
   * Save summary to localStorage
   */
  const saveSummaryToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
      console.log('Email summary saved to cache');
    } catch (err) {
      console.error('Error saving summary to cache:', err);
    }
  };

  /**
   * Fetch email summary from n8n webhook
   */
  const fetchEmailSummary = async (forceRefresh = false) => {
    try {
      // If not forcing refresh, try to load from cache first
      if (!forceRefresh) {
        const cached = loadCachedSummary();
        if (cached) {
          setSummaryData(cached);
          setLoading(false);
          return;
        }
      }

      // Get current user
      const user = await getCurrentUser();
      
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get Google access token
      const googleAccessToken = await getGoogleAccessToken();

      if (!googleAccessToken) {
        setError('Google account not connected');
        setLoading(false);
        return;
      }

      // Get n8n webhook URL
      const webhookUrl = urls.getEmailSummary();
      console.log('Email summary webhook URL:', webhookUrl);

      console.log('Fetching email summary from:', webhookUrl);

      const payload = {
        user_id: user.id,
        google_access_token: googleAccessToken
      };

      console.log('Sending payload:', { user_id: payload.user_id, has_token: !!payload.google_access_token });

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds
      });

      console.log('Email summary response:', response.data);

      if (response.data.success && response.data.summary) {
        setSummaryData(response.data.summary);
        saveSummaryToCache(response.data.summary);
        setError(null);
      } else {
        setError('Failed to fetch email summary');
      }
    } catch (err) {
      console.error('Error fetching email summary:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch email summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle refresh summary - force fetch from webhook
   */
  const handleRefreshSummary = async () => {
    setRefreshing(true);
    await fetchEmailSummary(true); // Force refresh
  };

  // Load summary on mount (from cache or fetch)
  useEffect(() => {
    fetchEmailSummary(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border-b border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-semibold text-red-900">Error Loading Summary</h3>
        </div>
        <p className="text-xs text-red-700">{error}</p>
        <button
          onClick={handleRefreshSummary}
          disabled={refreshing}
          className="mt-2 text-xs text-red-700 hover:text-red-800 font-medium"
        >
          {refreshing ? 'Retrying...' : 'Try again'}
        </button>
      </div>
    );
  }

  // No data state
  if (!summaryData || summaryData.status === 'failed') {
    return (
      <div className="p-4 text-center text-gray-500">
        <Mail className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium">{summaryData?.headline || 'No email summary available'}</p>
        <button
          onClick={handleRefreshSummary}
          disabled={refreshing}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Summary'}
        </button>
      </div>
    );
  }

  // Success state - no unread emails
  if (summaryData.source_metrics?.total_unread === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
        <p className="text-sm font-medium">All caught up!</p>
        <p className="text-xs">No unread emails</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Email Summary</h3>
        </div>
        <button
          onClick={handleRefreshSummary}
          disabled={refreshing}
          className="p-1 rounded hover:bg-white/50 transition-colors flex-shrink-0"
          title="Refresh summary"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Priority Badge */}
      <div className="mb-3">
        <PriorityBadge priority={summaryData.priority} />
      </div>

      {/* Metrics */}
      <div className="flex gap-3 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div className="text-left">
            <p className="text-xs text-gray-500">Unread</p>
            <p className="text-sm font-semibold text-gray-900">
              {summaryData.source_metrics?.total_unread || 0}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
          <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="text-left">
            <p className="text-xs text-gray-500">Analyzed</p>
            <p className="text-sm font-semibold text-gray-900">
              {summaryData.source_metrics?.fetched_email_count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 leading-relaxed">
          {summaryData.headline}
        </p>
      </div>

      {/* Summary Points */}
      {summaryData.summary_points && summaryData.summary_points.length > 0 && (
        <div className="mb-3 space-y-2">
          {summaryData.summary_points.map((point, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <span className="text-blue-600 font-bold text-xs mt-0.5 flex-shrink-0">•</span>
              <p className="text-xs text-gray-700 flex-1">{point}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {summaryData.recommendations && summaryData.recommendations.length > 0 && (
        <div className="p-3 bg-blue-100 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-2">💡 Recommendations:</p>
          <ul className="space-y-1">
            {summaryData.recommendations.map((rec, index) => (
              <li key={index} className="text-xs text-blue-800">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status indicator */}
      {summaryData.status === 'partial' && (
        <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ Some data may be incomplete
          </p>
        </div>
      )}
    </div>
  );
}
