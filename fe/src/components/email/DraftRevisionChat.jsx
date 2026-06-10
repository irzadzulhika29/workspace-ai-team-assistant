import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { urls } from '../../services/api';
import { getAuthenticatedUser, getWebhookUserIdentity } from '../../services/authService';
import { useEmailStore } from '../../store/emailStore';

export default function DraftRevisionChat({ draft, onClose, onDraftUpdated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const draftPreview = draft.body_html || draft.body_text || '';
    const sanitizedHtml = DOMPurify.sanitize(draftPreview, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'style']
    });

    setMessages([
      {
        role: 'ai',
        content: `Draft yang akan direvisi:

**To:** ${draft.to_email || draft.to}
**Subject:** ${draft.subject}

**Content:**`,
        htmlContent: sanitizedHtml
      },
      {
        role: 'ai',
        content: 'Silakan berikan instruksi revisi untuk draft ini. Contoh: "Make it more formal" atau "Add deadline information"'
      }
    ]);
  }, [draft]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const webhookUrl = urls.getEmail();

      const currentUser = await getAuthenticatedUser();
      const userIdentity = await getWebhookUserIdentity(currentUser);
      if (!userIdentity.user_id) {
        throw new Error('User not authenticated');
      }

      const payload = {
        ...userIdentity,
        draft_id: draft.id,
        action: 'revise',
        revision_instructions: userMessage,
        current_draft: {
          to: draft.to_email || draft.to,
          subject: draft.subject,
          body_text: draft.body_text,
          body_html: draft.body_html
        },
        source_email: draft.source_email_payload || {}
      };

      await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Draft email telah diperbarui, periksa kembali draft'
      }]);

      if (onDraftUpdated) {
        await useEmailStore.getState().fetchDrafts();
        
        const updatedDrafts = useEmailStore.getState().drafts;
        const updatedDraft = updatedDrafts.find(d => d.id === draft.id);
        
        await onDraftUpdated(updatedDraft || draft);
      }

    } catch (error) {

      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Error: ${error.response?.data?.error || error.message || 'Failed to revise draft'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Revise Draft</h3>
          <p className="text-xs text-gray-500">Chat with AI to improve your draft</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content && (
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              )}
              {msg.htmlContent && (
                <div
                  className="text-sm mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: msg.htmlContent }}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your revision instructions..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
