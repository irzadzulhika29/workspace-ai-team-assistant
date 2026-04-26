import React, { useEffect } from 'react';
import { Send, Edit3, Trash2, Mail, Clock } from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';
import DOMPurify from 'dompurify';
import axios from 'axios';
import { urls } from '../../services/api';

/**
 * DraftCard Component - Individual draft item
 */
const DraftCard = ({ draft, onSend, onRevise, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Render draft content - prefer HTML if available
   */
  const renderContent = () => {
    // Prefer HTML content if available
    if (draft.body_html) {
      const sanitizedHtml = DOMPurify.sanitize(draft.body_html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class']
      });

      return (
        <div 
          className="text-sm text-gray-700 prose prose-sm max-w-none overflow-y-auto custom-scrollbar"
          style={{ height: '300px' }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    // Fallback to plain text
    const content = draft.body_text || '';
    return (
      <div 
        className="text-sm text-gray-700 whitespace-pre-wrap overflow-y-auto custom-scrollbar"
        style={{ height: '300px' }}
      >
        {content}
      </div>
    );
  };

  const hasContent = draft.body_html || draft.body_text;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors flex flex-col" style={{ height: '480px' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {draft.subject || '(No subject)'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            To: {draft.to_email}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Created {formatDate(draft.created_at)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
          {draft.status === 'draft' ? 'Draft' : draft.status}
        </span>
      </div>

      {/* Draft Content Preview */}
      {hasContent && (
        <div className="flex-1 mb-3 overflow-hidden">
          <div className="h-full p-3 bg-gray-50 rounded-lg border border-gray-200">
            {renderContent()}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={() => onSend(draft)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span className="text-sm font-medium">Send</span>
        </button>

        <button
          onClick={() => onRevise(draft)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span className="text-sm font-medium">Revise</span>
        </button>

        <button
          onClick={() => onDelete(draft.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete draft"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * DraftsList Component - Display and manage email drafts
 */
export default function DraftsList({ onRevise }) {
  const { drafts, fetchDrafts, deleteDraft, loading } = useEmailStore();

  // Fetch drafts on mount
  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  /**
   * Handle send draft
   */
  const handleSend = async (draft) => {
    if (!confirm(`Send this email to ${draft.to_email}?`)) return;

    try {
      // Get user info and Google token
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const userResponse = await axios.get(`${backendUrl}/api/auth/google/status`, {
        withCredentials: true
      });
      const userId = userResponse.data.userId || userResponse.data.email || 'unknown';

      // Get Google token
      const tokenResponse = await axios.get(`${backendUrl}/api/google/token`, {
        withCredentials: true
      });
      const googleToken = tokenResponse.data;

      // Extract recipient from source email or draft
      const recipientEmail = draft.to_email || 
                            draft.source_email_payload?.from?.match(/<(.+?)>/)?.[1] || 
                            draft.source_email_payload?.from || 
                            '';

      if (!recipientEmail) {
        throw new Error('No recipient email found');
      }

      // Send to webhook with action "send"
      const baseUrl = urls.getN8nBaseUrl();
      const webhookUrl = `${baseUrl}/webhook-test/email`;
      const payload = {
        user_id: userId,
        draft_id: draft.id,
        action: 'send',
        current_draft: {
          to: recipientEmail,
          subject: draft.subject,
          body_text: draft.body_text,
          body_html: draft.body_html
        },
        source_email: {
          from: draft.source_email_payload?.from || '',
          id: draft.source_message_id || '',
          threadId: draft.source_thread_id || ''
        },
        google_token: googleToken
      };

      await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      // Refresh drafts
      await fetchDrafts();
      
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending draft:', error);
      alert('Failed to send email: ' + error.message);
    }
  };

  /**
   * Handle revise draft - pass to parent
   */
  const handleRevise = (draft) => {
    if (onRevise) {
      onRevise(draft);
    }
  };

  /**
   * Handle delete draft
   */
  const handleDelete = async (draftId) => {
    if (!confirm('Delete this draft?')) return;

    try {
      await deleteDraft(draftId);
    } catch (error) {
      alert('Failed to delete draft: ' + error.message);
    }
  };

  if (loading && !drafts) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!drafts || drafts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No drafts yet</p>
          <p className="text-sm">Use &quot;Magic Reply&quot; to create AI-powered email drafts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Drafts</h2>
        <p className="text-sm text-gray-600">
          {drafts.length} draft{drafts.length !== 1 ? 's' : ''} ready to send
        </p>
      </div>

      {/* Drafts Grid */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 gap-4">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onSend={handleSend}
              onRevise={handleRevise}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
