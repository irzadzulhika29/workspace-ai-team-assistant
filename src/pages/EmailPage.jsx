import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Inbox, Star, Mail, Send } from 'lucide-react';
import { useEmailStore } from '../store/emailStore';
import EmailList from '../components/email/EmailList';
import EmailDetail from '../components/email/EmailDetail';

/**
 * EmailPage Component - Main email interface
 */
export default function EmailPage() {
  const {
    fetchEmails,
    loadMoreEmails,
    searchEmails,
    setFilter,
    filters,
    loading,
    error,
    nextPageToken,
    resultSizeEstimate
  } = useEmailStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch emails on mount
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  /**
   * Handle search submit
   */
  const handleSearch = (e) => {
    e.preventDefault();
    searchEmails(searchQuery);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterType) => {
    switch (filterType) {
      case 'inbox':
        setFilter('labelIds', 'INBOX');
        setFilter('unreadOnly', false);
        setFilter('starredOnly', false);
        break;
      case 'unread':
        setFilter('unreadOnly', true);
        setFilter('starredOnly', false);
        break;
      case 'starred':
        setFilter('starredOnly', true);
        setFilter('unreadOnly', false);
        break;
      case 'sent':
        setFilter('labelIds', 'SENT');
        setFilter('unreadOnly', false);
        setFilter('starredOnly', false);
        break;
      default:
        break;
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    fetchEmails();
  };

  /**
   * Get active filter
   */
  const getActiveFilter = () => {
    if (filters.starredOnly) return 'starred';
    if (filters.unreadOnly) return 'unread';
    if (filters.labelIds === 'SENT') return 'sent';
    return 'inbox';
  };

  const activeFilter = getActiveFilter();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Email</h1>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Filters */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            <button
              onClick={() => handleFilterChange('inbox')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'inbox'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span>Inbox</span>
              {activeFilter === 'inbox' && (
                <span className="ml-auto text-sm">{resultSizeEstimate}</span>
              )}
            </button>

            <button
              onClick={() => handleFilterChange('starred')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'starred'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className="w-5 h-5" />
              <span>Starred</span>
            </button>

            <button
              onClick={() => handleFilterChange('unread')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'unread'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Mail className="w-5 h-5" />
              <span>Unread</span>
            </button>

            <button
              onClick={() => handleFilterChange('sent')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'sent'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>Sent</span>
            </button>
          </nav>
        </div>

        {/* Email List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          <EmailList />
          
          {/* Load More Button */}
          {nextPageToken && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={loadMoreEmails}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>

        {/* Email Detail */}
        <EmailDetail />
      </div>
    </div>
  );
}
