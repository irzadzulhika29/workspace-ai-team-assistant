import React from 'react';
import { Star, Mail, MailOpen } from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';

/**
 * EmailList Component - Display list of emails
 */
export default function EmailList() {
  const { emails, loading, selectedEmail, selectEmail, toggleStar } = useEmailStore();

  /**
   * Format date to relative time (e.g., "2 hours ago")
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Extract sender name from "Name <email@example.com>" format
   */
  const extractSenderName = (from) => {
    if (!from) return 'Unknown';
    const match = from.match(/^(.+?)\s*<.*>$/);
    return match ? match[1].trim() : from.split('@')[0];
  };

  /**
   * Check if email is unread
   */
  const isUnread = (email) => {
    return email.labelIds?.includes('UNREAD');
  };

  /**
   * Check if email is starred
   */
  const isStarred = (email) => {
    return email.labelIds?.includes('STARRED');
  };

  /**
   * Handle star click
   */
  const handleStarClick = (e, messageId) => {
    e.stopPropagation(); // Prevent email selection
    toggleStar(messageId);
  };

  if (loading && emails.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="border-b border-gray-200 p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No emails found</p>
          <p className="text-sm">Your inbox is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => selectEmail(email.id)}
          className={`
            border-b border-gray-200 p-4 cursor-pointer transition-colors
            hover:bg-gray-50
            ${selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
            ${isUnread(email) ? 'bg-white' : 'bg-gray-50'}
          `}
        >
          <div className="flex items-start gap-3">
            {/* Star Icon */}
            <button
              onClick={(e) => handleStarClick(e, email.id)}
              className="mt-1 text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Star
                className={`w-5 h-5 ${isStarred(email) ? 'fill-yellow-500 text-yellow-500' : ''}`}
              />
            </button>

            {/* Email Content */}
            <div className="flex-1 min-w-0">
              {/* Sender and Time */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isUnread(email) && (
                    <Mail className="w-4 h-4 text-blue-500" />
                  )}
                  {!isUnread(email) && (
                    <MailOpen className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${isUnread(email) ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
                    {extractSenderName(email.from)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatDate(email.date || email.internalDate)}
                </span>
              </div>

              {/* Subject */}
              <div className={`text-sm mb-1 truncate ${isUnread(email) ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'}`}>
                {email.subject || '(No subject)'}
              </div>

              {/* Snippet */}
              <div className="text-xs text-gray-600 truncate">
                {email.snippet}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
