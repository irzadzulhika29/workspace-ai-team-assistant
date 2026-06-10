import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Loader2 } from 'lucide-react';
import { chatApi } from '../../services/chatService';

/**
 * DocumentChat Component
 * Chat interface for asking questions about a specific document
 */
export default function DocumentChat({ document }) {
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

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Siap bantu soal "${document.name}". Ada yang ingin ditanyakan?`
      }
    ]);
  }, [document]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Send to /chat-document endpoint (dedicated for document Q&A)
      const response = await chatApi.sendToDocumentChat(userMessage, {
        document_id: document.id,
        document_name: document.name,
        document_url: document.url
      });

      // Add AI response (handle {output: "..."} format from /chat-document)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.output || response.message || response.response || 'No response received'
      }]);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response'}`
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
    <div className="flex h-full min-h-[24rem] flex-col">
   

      {/* Messages */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.role === 'user' ? (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none break-words
                  prose-p:my-1.5 prose-p:leading-relaxed
                  prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
                  prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
                  prose-li:my-0.5
                  prose-strong:font-bold prose-strong:text-slate-900
                  prose-headings:font-semibold prose-headings:my-2
                  prose-a:text-brand-600 prose-a:underline
                  prose-code:bg-slate-200 prose-code:px-1 prose-code:rounded prose-code:text-xs
                  prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto
                  prose-blockquote:border-l-2 prose-blockquote:border-slate-300 prose-blockquote:pl-3 prose-blockquote:text-slate-500
                  prose-table:w-full prose-table:border-collapse prose-table:my-3
                  prose-th:bg-slate-100 prose-th:border prose-th:border-slate-300 prose-th:px-3 prose-th:py-2 prose-th:text-left
                  prose-td:border prose-td:border-slate-300 prose-td:px-3 prose-td:py-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this document..."
            className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-900 caret-neutral-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <p className="text-xs text-slate-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
