import React, { useState } from 'react';
import { ArrowLeft, Star, Sparkles, Mail, MailOpen, Download } from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import { generateDraftFromWebhook } from '../../services/emailWebhookService';
import DOMPurify from 'dompurify';

/**
 * EmailDetail Component - Display full email content
 */
export default function EmailDetail({ onDraftCreated }) {
  const { selectedEmail, loadingDetail, clearSelectedEmail, markAsRead, toggleStar, fetchDrafts } = useEmailStore();
  const [generatingDraft, setGeneratingDraft] = useState(false);

  if (!selectedEmail && !loadingDetail) {
    return (
      <div className="flex h-full min-h-0 max-h-full flex-1 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 text-gray-500">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Select an email to read</p>
          <p className="text-sm">Choose an email from the list to view its contents</p>
        </div>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div className="flex h-full min-h-0 max-h-full flex-1 flex-col overflow-hidden rounded-2xl bg-white">
        <div className="flex-1 overflow-y-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  const email = selectedEmail;

  /**
   * Format date to readable format
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Check if email is unread
   */
  const isUnread = () => {
    return email.labelIds?.includes('UNREAD');
  };

  /**
   * Check if email is starred
   */
  const isStarred = () => {
    return email.labelIds?.includes('STARRED');
  };

  /**
   * Sanitize and render HTML email body
   */
  const renderEmailBody = () => {
    const bodyContent = email.htmlBody || email.body;
    
    if (!bodyContent) {
      return <p className="text-gray-500 italic">No content</p>;
    }

    // Sanitize HTML to prevent XSS
    const sanitizedHtml = DOMPurify.sanitize(bodyContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'class']
    });

    return (
      <div 
        className="prose prose-sm max-w-none prose-img:max-h-48 prose-img:w-auto prose-img:object-contain"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  };

  /**
   * Handle Draft Reply - Create draft by sending email to webhook
   */
  const handleDraftReply = async () => {
    setGeneratingDraft(true);

    try {
      // Send email to webhook to generate draft
      // Note: Webhook n8n already saves draft to Supabase
      const result = await generateDraftFromWebhook(email, fetchDrafts);

      if (result.success) {
        // Notify parent to switch to drafts tab
        if (onDraftCreated) {
          onDraftCreated();
        }
      } else {
        alert('Failed to create draft. Please try again.');
      }
    } catch (error) {
      console.error('Error creating draft:', error);
      alert(`Error creating draft: ${error.message}`);
    } finally {
      setGeneratingDraft(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 max-h-full flex-1 flex-col overflow-hidden rounded-2xl bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={clearSelectedEmail}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Inbox</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Draft Reply Button */}
            <button
              onClick={handleDraftReply}
              disabled={generatingDraft}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff623d] text-white hover:bg-[#ff744f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Create draft reply via AI"
            >
              <Sparkles className={`w-4 h-4 ${generatingDraft ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">
                {generatingDraft ? 'Generating...' : 'Draft Reply'}
              </span>
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            <button
              onClick={() => toggleStar(email.id)}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title={isStarred() ? 'Unstar' : 'Star'}
            >
              <Star
                className={`w-5 h-5 ${isStarred() ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`}
              />
            </button>

            <button
              onClick={() => markAsRead(email.id, !isUnread())}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              title={isUnread() ? 'Mark as read' : 'Mark as unread'}
            >
              {isUnread() ? (
                <Mail className="w-5 h-5 text-gray-600" />
              ) : (
                <MailOpen className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Email Metadata */}
        <div className="space-y-2">
          <h1 className="text-sm font-semibold text-gray-900">
            {email.subject || '(No subject)'}
          </h1>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {email.from?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{email.from}</span>
                {isUnread() && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    Unread
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span>To: {email.to}</span>
                {email.cc && (
                  <span className="ml-2">Cc: {email.cc}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(email.date || email.internalDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Email Body */}
        <div className="p-6">
          {renderEmailBody()}
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Attachments ({email.attachments.length})
            </h3>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {attachment.filename}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
