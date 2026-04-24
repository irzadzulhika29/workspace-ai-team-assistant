import React, { useState } from 'react'
import DOMPurify from 'dompurify'
import { ChevronDown, ExternalLink, Calendar, Mail, Ticket, Send, RefreshCw } from 'lucide-react'

/**
 * AgentCard — displays structured results from PM Agent (Jira + Google Calendar)
 * @param {Object} props
 * @param {string} props.jiraUrl
 * @param {string} props.calendarUrl
 * @param {string} props.agentUsed
 * @param {Object} props.emailDraft
 * @param {Function} props.onSendEmail - callback untuk kirim email
 * @param {Function} props.onRegenerateEmail - callback untuk buat ulang draft
 */
export default function AgentCard({ jiraUrl, calendarUrl, emailDraft, agentUsed, onSendEmail, onRegenerateEmail }) {
  const [improvementText, setImprovementText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  if (!jiraUrl && !calendarUrl && !emailDraft) return null

  const safeEmailHtml = emailDraft?.message
    ? DOMPurify.sanitize(emailDraft.message)
    : ''

  const handleSendEmail = async () => {
    if (!onSendEmail || !emailDraft) return
    
    setIsSending(true)
    try {
      await onSendEmail(emailDraft)
    } finally {
      setIsSending(false)
    }
  }

  const handleRegenerateEmail = async () => {
    if (!onRegenerateEmail || !emailDraft) return
    
    if (!improvementText.trim()) {
      alert('Silakan masukkan perbaikan yang diinginkan')
      return
    }

    setIsRegenerating(true)
    try {
      await onRegenerateEmail(emailDraft, improvementText)
      setImprovementText('') // Clear input after regenerate
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="
      border border-gray-200 rounded-lg p-4 bg-white shadow-sm
      mt-2 space-y-3 animate-fade-in
    ">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
        {agentUsed ?? 'pm'} agent — action results
      </div>

      {jiraUrl && (
        <a
          href={jiraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-3 p-3 rounded-md
            bg-blue-50 border border-blue-100
            hover:bg-blue-100 transition-colors duration-150
            group
          "
        >
          <Ticket size={16} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-700">Jira Ticket Dibuat</p>
            <p className="text-xs text-blue-500 truncate">{jiraUrl}</p>
          </div>
          <ExternalLink size={14} className="text-blue-400 flex-shrink-0 group-hover:text-blue-600" />
        </a>
      )}

      {calendarUrl && (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-3 p-3 rounded-md
            bg-green-50 border border-green-100
            hover:bg-green-100 transition-colors duration-150
            group
          "
        >
          <Calendar size={16} className="text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-700">Event Kalender Dibuat</p>
            <p className="text-xs text-green-500 truncate">{calendarUrl}</p>
          </div>
          <ExternalLink size={14} className="text-green-400 flex-shrink-0 group-hover:text-green-600" />
        </a>
      )}

      {emailDraft && (
        <div className="rounded-md border border-amber-100 bg-amber-50">
          <details>
            <summary className="
              flex cursor-pointer list-none items-center gap-3 p-3
              text-left marker:content-none
            ">
              <Mail size={16} className="text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">Draft Email Siap Direview</p>
                <p className="text-xs text-amber-700 truncate">
                  Subject: {emailDraft.subject || '(tanpa subjek)'}
                </p>
                <p className="text-xs text-amber-600 truncate">
                  To: {emailDraft.to || 'belum ditentukan'}
                </p>
              </div>
              <ChevronDown size={14} className="text-amber-500 flex-shrink-0" />
            </summary>

            <div className="border-t border-amber-100 px-3 py-3">
              <div
                className="
                  max-h-80 overflow-auto rounded-md border border-amber-100 bg-white p-3
                  text-sm leading-relaxed
                "
                dangerouslySetInnerHTML={{ __html: safeEmailHtml }}
              />
            </div>
          </details>

          {/* Action Buttons & Improvement Input */}
          <div className="border-t border-amber-100 px-3 py-3 space-y-3">
            {/* Improvement Input */}
            <div>
              <label className="block text-xs font-medium text-amber-800 mb-1.5">
                Perbaikan (opsional):
              </label>
              <input
                type="text"
                value={improvementText}
                onChange={(e) => setImprovementText(e.target.value)}
                placeholder="Contoh: Buat lebih formal, tambahkan salam pembuka..."
                className="
                  w-full px-3 py-2 text-sm
                  border border-amber-200 rounded-md
                  bg-white text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
                  disabled:bg-gray-50 disabled:cursor-not-allowed
                "
                disabled={isSending || isRegenerating}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSendEmail}
                disabled={isSending || isRegenerating || !emailDraft.to}
                className="
                  flex-1 flex items-center justify-center gap-2 px-4 py-2
                  bg-blue-600 text-white text-sm font-medium rounded-md
                  hover:bg-blue-700 active:bg-blue-800
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors duration-150
                "
                title={!emailDraft.to ? 'Email tujuan belum ditentukan' : 'Kirim email sekarang'}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Kirim</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRegenerateEmail}
                disabled={isSending || isRegenerating}
                className="
                  flex-1 flex items-center justify-center gap-2 px-4 py-2
                  bg-amber-600 text-white text-sm font-medium rounded-md
                  hover:bg-amber-700 active:bg-amber-800
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-colors duration-150
                "
              >
                {isRegenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Membuat...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Buat Ulang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
